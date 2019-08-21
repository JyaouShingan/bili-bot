import {PassThrough, Readable} from 'stream';
import {BilibiliSong} from "./model/bilibili-song";
import {Logger, getLogger} from "../utils/logger";
import * as Ffmpeg from "fluent-ffmpeg";
import * as ytdl from "youtube-dl";
import {EventEmitter} from "events";

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
    protected song: BilibiliSong;
    protected logger: Logger;
    protected videoStream: Readable;
    protected ffmpegCommand: Ffmpeg.FfmpegCommand;
    protected output: PassThrough;
    protected transferStream: PassStream;
    public state: StreamerState;

    public constructor(song: BilibiliSong) {
        super();
        const bufferSize =  10 * 1024 * 1024; // 10 mb

        this.song = song;
        this.logger = getLogger("Streamer");
        this.ffmpegCommand = Ffmpeg();
        this.output = new PassThrough({highWaterMark: bufferSize});
        this.transferStream = new PassStream({highWaterMark: bufferSize});
        this.state = StreamerState.UNLOADED;
    }

    public start(): Readable {
        if (this.state !== StreamerState.UNLOADED) {
            return this.output;
        }
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
            .on('error', (err): void => {
                this.logger.error(`FFmpeg error: ${err}`);
            })
            .on('end', (): void => {
                this.logger.verbose('FFmpeg transcode complete');
                this.state = StreamerState.LOADED;
                this.emit('finish');
            })
            .pipe(this.output);
        return this.output;
    }

    public destroy(): void {
        this.videoStream.destroy();
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
}
