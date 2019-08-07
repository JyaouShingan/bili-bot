import { PassThrough } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ytdl from 'youtube-dl';
import { BilibiliSong } from "./bilibili-song";
import { getLogger } from "./logger";
import { Logger } from "winston";
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


    constructor(public song: BilibiliSong) {
        this.logger = getLogger("Streamer");
        this.ffmpegCommand = ffmpeg();
        this.output = new PassThrough();
        this.transferStream = new PassStream();
    }

    start() {
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
    }

    getOutputStream() {
        return this.output;
    }
}