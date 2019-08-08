import {EventEmitter} from "events";
import {Message} from "discord.js";
import {Logger, getLogger} from "./logger";
import * as Promise from "bluebird";
import * as youtubedl from "youtube-dl";
import {BilibiliSong} from "./bilibili-song";

let getInfo = Promise.promisify(youtubedl.getInfo);

export const CommandType = {
    info: 'info',
    play: 'play',
    pause: 'pause',
    resume: 'resume',
    stop: 'stop',
    help: 'help'
};

export class CommandEngine extends EventEmitter {
    logger: Logger;

    constructor() {
        super();
        this.logger = getLogger('CommandEngine');
    }

    process(msg: Message, args: string[]) {
        let command = args.shift();
        switch (command) {
            case CommandType.info:
                this.processInfo(msg, args);
                break;
            case CommandType.play:
                this.processPlay(msg, args);
                break;
            case CommandType.pause:
                this.processPause(msg);
                break;
            case CommandType.resume:
                this.processResume(msg);
                break;
            default:
                break;
        }
    }

    processInfo(msg: Message, args: string[]) {
        if (args.length == 0) {
            this.emit('usage', `info [video_url]`);
            return;
        }
        getInfo(args.shift()).then((info) => {
            this.emit(CommandType.info, msg, new BilibiliSong(info, msg.author));
        }).catch((err) => {
            this.emit('error', msg, err);
        });
    }

    processPlay(msg: Message, args: string[]) {
        if (args.length == 0) {
            this.emit('usage', `play [video_url]`);
            return;
        }
        getInfo(args.shift()).then((info) => {
            this.emit(CommandType.play, msg, new BilibiliSong(info, msg.author));
        }).catch((err) => {
            this.emit('error', msg, err);
        });
    }

    processPause(msg: Message) {
        this.emit(CommandType.pause, msg);
    }

    processResume(msg: Message) {
        this.emit(CommandType.resume, msg);
    }

}

