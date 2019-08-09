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
    help: 'help',
    next: 'next',
    shuffle: 'shuffle',
    clear: 'clear',
    leave: 'leave',
    list: 'list',
    promote: 'promote'
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
            case CommandType.next:
                this.processNext(msg);
                break;
            case CommandType.stop:
                this.processStop(msg);
                break;
            case CommandType.shuffle:
                this.processShuffle(msg);
                break;
            case CommandType.clear:
                this.processClear(msg);
                break;
            case CommandType.leave:
                this.processLeave(msg);
                break;
            case CommandType.list:
                this.processList(msg);
                break;
            case CommandType.promote:
                this.processPromote(msg, args);
                break;
            default:
                break;
        }
    }

    processInfo(msg: Message, args: string[]) {
        if (args.length === 0) {
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
        if (args.length === 0) {
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

    processNext(msg: Message) {
        this.emit(CommandType.next, msg);
    }

    processStop(msg: Message) {
        this.emit(CommandType.stop, msg);
    }

    processClear(msg: Message) {
        this.emit(CommandType.clear, msg);
    }

    processShuffle(msg: Message) {
        this.emit(CommandType.shuffle, msg);
    }

    processLeave(msg: Message) {
        this.emit(CommandType.leave, msg);
    }

    processList(msg: Message) {
        this.emit(CommandType.list, msg);
    }

    processPromote(msg: Message, args: string[]) {
        if (args.length === 0) {
            this.emit('usage', `promote [list-index]`);
            return;
        }
        const index = parseInt(args.shift());
        if (isNaN(index) || !Number.isInteger(index)) {
            this.emit('usage', `promote [list-index]`);
            return;
        }
        this.emit(CommandType.promote, msg, index - 1);
    }
}

