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

export class Streamer extends EventEmitter {
    protected song: BilibiliSong;
    protected logger: Logger;
    protected videoStream: Readable;
    protected ffmpegCommand: Ffmpeg.FfmpegCommand;
    protected output: PassThrough;
    protected transferStream: PassStream;
    public isLoading: boolean;

    public constructor(song: BilibiliSong) {
        super();
        const bufferSize =  1024 * 1024; // 1 mb

        this.song = song;
        this.logger = getLogger("Streamer");
        this.ffmpegCommand = Ffmpeg();
        this.output = new PassThrough({highWaterMark: bufferSize});
        this.transferStream = new PassStream({highWaterMark: bufferSize});
        this.isLoading = false;
    }

    public start(): Readable {
        this.isLoading = true;
        this.videoStream = ytdl(this.song.url, ['--format=best'], null) as Readable;
        this.videoStream.on('info', (_): void => {
            this.logger.info(`Start downloading video: ${this.song.title}`);
        });
        this.videoStream.on('end', (): void => {
            this.logger.info(`Finish downloading song: ${this.song.title}`);
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
                this.logger.info('FFmpeg transcode complete');
                this.emit('finish');
            })
            .pipe(this.output);
        return this.output;
    }

    public stop(): void {
        this.videoStream.destroy();
        this.output.destroy();
    }

    public getOutputStream(): Readable {
        return this.output;
    }
}
