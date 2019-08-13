import {PassThrough, Readable} from 'stream';
import * as ytdl from 'youtube-dl';
import {BilibiliSong} from "./bilibili-song";
import {Logger, getLogger} from "./logger";
import * as Ffmpeg from "fluent-ffmpeg";

class PassStream extends PassThrough {
    close() {}
    path: string;
    bytesWritten: number;
}

export class Streamer {
    logger: Logger;
    ffmpegCommand: Ffmpeg.FfmpegCommand;
    output: PassThrough;
    transferStream: PassStream;
    isLoading: boolean;

    constructor(public song: BilibiliSong) {
        const bufferSize = 10 * 1024 * 1024; // 10 mb

        this.logger = getLogger("Streamer");
        this.ffmpegCommand = Ffmpeg();
        this.output = new PassThrough({highWaterMark: bufferSize});
        this.transferStream = new PassStream({highWaterMark: bufferSize});
        this.isLoading = false;
    }

    start(): Readable {
        this.isLoading = true;
        let video = ytdl(this.song.url, ['--format=best'], null);
        video.on('info', (info) => {
            this.logger.info(`Start downloading video: ${this.song.title}`);
        });
        video.on('end', () => {
            this.logger.info(`Finish downloading song: ${this.song.title}`);
        });
        video.pipe(this.transferStream);

        this.ffmpegCommand
            .input(this.transferStream)
            .noVideo()
            .audioCodec('libmp3lame')
            .outputFormat('mp3')
            .on('error', (err) => {
                this.logger.error(`FFmpeg error: ${err}`);
            })
            .pipe(this.output);
        return this.output;
    }

    getOutputStream(): Readable {
        return this.output;
    }
}
