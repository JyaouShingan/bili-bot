import {EventEmitter} from "events";
import {Message} from "discord.js";
import {Logger, getLogger} from "./logger";
import * as Promise from "bluebird";
import * as youtubedl from "youtube-dl";
import {BilibiliSong} from "./bilibili-song";
import * as api from "./bilibili-api";

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
    save: 'save',
    load: 'load',
    list: 'list',
    promote: 'promote',
    search: 'search',
    select: 'select',
    random: 'random',
    showlist: 'showlist',
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
            case CommandType.save:
                this.processSave(msg, args);
                break;
            case CommandType.load:
                this.processLoad(msg, args);
                break;
            case CommandType.list:
                this.processList(msg);
                break;
            case CommandType.promote:
                this.processPromote(msg, args);
                break;
            case CommandType.search:
                this.processSearch(msg, args);
                break;
            case CommandType.select:
                this.processSelect(msg, args);
                break;
            case CommandType.random:
                this.processRandom(msg, args);
                break;
            case CommandType.showlist:
                this.processShowlist(msg, args);
                break;
            default:
                break;
        }
    }

    processInfo(msg: Message, args: string[]) {
        if (args.length === 0) {
            this.emit(CommandType.info, msg, null);
        } else {
            getInfo(args.shift()).then((info) => {
                this.emit(CommandType.info, msg, new BilibiliSong(info, msg.author));
            }).catch((err) => {
                this.emit('error', msg, err);
            });
        }
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

    processSave(msg: Message, args: string[]) {
        if (args.length === 0) {
            this.emit(CommandType.save, msg, null);
            return;
        } else if (args.length === 1) {
            this.logger.info(`Saving to ${args[0]}`);
            this.emit(CommandType.save, msg, args[0]);
            return;
        } else {
            // Ignore you
        }
    }

    processLoad(msg: Message, args: string[]) {
        if (args.length === 0) {
            this.emit(CommandType.load, msg, null);
            return;
        } else if (args.length === 1) {
            this.logger.info(`Loading to ${args[0]}`);
            this.emit(CommandType.load, msg, args[0]);
            return;
        } else {
            // Ignore you
        }
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

    processSearch(msg: Message, args: string[]) {
        if (args.length === 0) {
            this.emit('usage', `search [keyword]`);
            return;
        }

        const keyword = args.shift();
        let limit = parseInt(args.shift());
        limit = limit ? limit : 20;

        api.search(keyword, limit).then((entities) => {
            this.emit(CommandType.search, msg, entities);
        }).catch(error => {
            this.logger.error(`Search error: ${error}`);
            this.emit('error', msg, error);
        });
    }

    processSelect(msg: Message, args: string[]) {
        if (args.length === 0) {
            this.emit('usage', `select [result-index]`);
            return;
        }
        const index = parseInt(args.shift());
        if (isNaN(index) || !Number.isInteger(index)) {
            this.emit('usage', `select [result-index]`);
            return;
        }
        this.emit(CommandType.select, msg, index - 1);
    }

    processRandom(msg: Message, args: string[]) {
        if (args.length === 0) {
            this.emit(CommandType.random, msg);
        } else if (args[0] == "-b"){
            const catagory = args[1] || 'music';
            // TODO: add type support
            api.randomRanking(catagory, "all").then((entity) => {
                this.emit(CommandType.random, msg, "bilibili", entity);
            }).catch(error => {
                this.logger.error(`Song random error: ${error}`);
                this.emit('error', msg, error);
            });
        } else {
            // More
        }
    }

    processShowlist(msg: Message, args: string[]) {
        const playlist = args[0] || 'default';
        this.emit(CommandType.showlist, msg, playlist);
    }
}

