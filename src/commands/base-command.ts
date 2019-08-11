import {Logger, getLogger} from "../logger";
import {Message} from "discord.js";
import {GuildManager} from "../guild";
import * as Promise from 'bluebird';

export enum CommandType {
    INFO = 'info',
    PLAY = 'play',
    PAUSE = 'pause',
    RESUME = 'resume',
    STOP = 'stop',
    HELP = 'help',
    NEXT = 'next',
    SHUFFLE = 'shuffle',
    CLEAR = 'clear',
    LEAVE = 'leave',
    SAVE = 'save',
    LOAD = 'load',
    LIST = 'list',
    PROMOTE = 'promote',
    SEARCH = 'search',
    SELECT = 'select',
    RANDOM = 'random',
    SHOWLIST = 'showlist',

    INVALID = 'invalid'
}

export interface Command {
    readonly logger: Logger
    getType(): CommandType
    run(message: Message, guild: GuildManager, args?: string[]): Promise<void>
    helpMessage(): string
}

export class BaseCommand implements Command {
    readonly logger: Logger;
    private readonly _type: CommandType;

    constructor() {
        this._type = this.type();
        this.logger = getLogger(`Command - ${this._type}`);
    }

    protected type(): CommandType {
        return CommandType.INVALID;
    }

    getType(): CommandType {
        return this._type
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        // Noop
        return Promise.resolve();
    }

    helpMessage(): string {
        return 'BaseCommand - Override this';
    }
}

export class CommandException {
    userPresentable: boolean;
    error: any ;

    constructor(userPresentable: boolean, error: any) {
        this.userPresentable = userPresentable;
        this.error = error;
    }

    static UserPresentable(message: string): CommandException {
        return new CommandException(true, message);
    }

    static Internal(error: any): CommandException {
        return new CommandException(false, error);
    }

    toString() {
        return this.error.toString();
    }
}