import {PassThrough, Readable} from 'stream';
import * as ytdl from 'youtube-dl';
import {BilibiliSong} from "./bilibili-song";
import {Logger, getLogger} from "./logger";
import * as Ffmpeg from "fluent-ffmpeg";

class PassStream extends PassThrough {
    public close(): void {}
    public path: string;
    public bytesWritten: number;
}

export class Streamer {
    protected song: BilibiliSong;
    protected logger: Logger;
    protected ffmpegCommand: Ffmpeg.FfmpegCommand;
    protected output: PassThrough;
    protected transferStream: PassStream;
    public isLoading: boolean;

    public constructor(song: BilibiliSong) {
        const bufferSize = 10 * 1024 * 1024; // 10 mb

        this.song = song;
        this.logger = getLogger("Streamer");
        this.ffmpegCommand = Ffmpeg();
        this.output = new PassThrough({highWaterMark: bufferSize});
        this.transferStream = new PassStream({highWaterMark: bufferSize});
        this.isLoading = false;
    }

    public start(): Readable {
        this.isLoading = true;
        const video = ytdl(this.song.url, ['--format=best'], null);
        video.on('info', (_): void => {
            this.logger.info(`Start downloading video: ${this.song.title}`);
        });
        video.on('end', (): void => {
            this.logger.info(`Finish downloading song: ${this.song.title}`);
        });
        video.pipe(this.transferStream);

        this.ffmpegCommand
            .input(this.transferStream)
            .noVideo()
            .audioCodec('libmp3lame')
            .outputFormat('mp3')
            .on('error', (err): void => {
                this.logger.error(`FFmpeg error: ${err}`);
            })
            .pipe(this.output);
        return this.output;
    }

    public getOutputStream(): Readable {
        return this.output;
    }
}
