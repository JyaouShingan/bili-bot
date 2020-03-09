import {PassThrough, Readable} from 'stream';
import {BilibiliSong} from "./model/bilibili-song";
import {Logger, getLogger} from "../utils/logger";
import * as Ffmpeg from "fluent-ffmpeg";
import * as ytdl from "youtube-dl";
import * as path from "path";
import * as fs from "fs";
import {EventEmitter} from "events";
import Config from "../configuration";
import {GoogleCloudDataSource} from "./datasources/google-cloud-datasource";
import {SongDataSource} from "./datasources/song-datasource";

class PassStream extends PassThrough {
    public close(): void {}
    public path: string;
    public bytesWritten: number;
}

export enum StreamerState {
    UNLOADED,
    LOADING,
    LOADED,
    CACHED
}

export class Streamer extends EventEmitter {
    private readonly bufferSize;
    protected song: BilibiliSong;
    protected logger: Logger;
    protected videoStream: Readable;
    protected ffmpegCommand: Ffmpeg.FfmpegCommand;
    protected output: PassThrough;
    protected transferStream: PassStream;
    public state: StreamerState;

    public constructor(song: BilibiliSong) {
        super();
        this.bufferSize =  10 * 1024 * 1024; // 10 mb
        this.song = song;
        this.logger = getLogger("Streamer");
        this.output = new PassThrough({highWaterMark: this.bufferSize});
        this.state = StreamerState.UNLOADED;
    }

    public start(): Readable {
        // Check cache state
        if (this.song.cached) {
            this.logger.info(`Cache exist, loading from GCS - ${this.song.title}`);
            this.state = StreamerState.CACHED;
            const sourceStream = GoogleCloudDataSource.getInstance().getReadStream(this.cacheName());
            sourceStream.on('end', (): void => {
                this.logger.info(`Cache loaded - ${this.song.title}`);
            });
            sourceStream.pipe(this.output);
            return this.output;
        }

        if (this.state !== StreamerState.UNLOADED) {
            return this.output;
        }

        return this.runPipeline();
    }

    private runPipeline(): Readable {
        this.ffmpegCommand = Ffmpeg();
        this.transferStream = new PassStream({highWaterMark: this.bufferSize});

        this.state = StreamerState.LOADING;
        this.videoStream = ytdl(this.song.url, ['--format=best'], null) as Readable;
        this.videoStream.on('info', (_): void => {
            this.logger.verbose(`Start downloading video: ${this.song.title}`);
        });
        this.videoStream.on('end', (): void => {
            this.logger.verbose(`Finish downloading song: ${this.song.title}`);
        });
        this.videoStream.on('error', (error): void => {
            this.logger.error(`YoutubeDL failed: ${error}`);
            this.state = StreamerState.UNLOADED;
        });
        this.videoStream.pipe(this.transferStream);

        this.ffmpegCommand
            .input(this.transferStream)
            .noVideo()
            .audioCodec('libmp3lame')
            .outputFormat('mp3')
            .output(this.output as PassThrough)
            .output(this.localCachePath())
            .on('error', (err): void => {
                this.logger.error(`FFmpeg error: ${err}`);
            })
            .on('end', async (): Promise<void> => {
                this.logger.verbose('FFmpeg transcode complete');
                this.state = StreamerState.LOADED;
                this.emit('finish');
                await this.uploadCache();
            })
            .run();
        return this.output;
    }

    public destroy(): void {
        if(this.videoStream) this.videoStream.destroy();
        if(this.transferStream) this.transferStream.destroy();
        this.output.destroy();
        this.removeAllListeners();
    }

    public stop(): void {
        this.state = StreamerState.UNLOADED;
        this.logger.info('Destroying streamer');
        this.destroy();
    }

    public getOutputStream(): Readable {
        return this.output;
    }

    private async uploadCache(): Promise<void> {
        if (!await SongDataSource.getInstance().isCached(this.song.uid)) {
            this.logger.info(`Start caching to Google Cloud Storage - ${this.song.title}`);
            await GoogleCloudDataSource.getInstance().upload(this.cacheName(), this.localCachePath());
            await SongDataSource.getInstance().setCached(this.song.uid, true);
            fs.unlinkSync(this.localCachePath());
            this.logger.info(`Finish caching to Google Cloud Storage - ${this.song.title}`);
        }
    }

    private cacheName(): string {
        return `${this.song.uid}.mp3`;
    }

    private localCachePath(): string {
        return path.join(Config.getLocalCacheDirectory(), this.cacheName());
    }
}
