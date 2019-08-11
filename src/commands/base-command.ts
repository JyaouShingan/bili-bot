import {Logger, getLogger} from "../logger";
import {Message} from "discord.js";
import {GuildManager} from "../guild";
import {CommandType} from "./command-type";
import * as Promise from 'bluebird';

export interface Command {
    readonly logger: Logger
    type(): CommandType
    run(message: Message, guild: GuildManager, args?: string[]): Promise<void>
    helpMessage(): string
}

export class BaseCommand implements Command {
    readonly logger: Logger;

    constructor() {
        this.logger = getLogger(`Command - ${this.type()}`);
    }

    type(): CommandType {
        return CommandType.INVALID;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        // Noop
        return Promise.resolve();
    }

    helpMessage(): string {
        throw new Error('helpMessage() requires override');
    }
}

export class CommandException {
    userPresentable: boolean;
    error: string|Error;

    constructor(userPresentable: boolean, error: string|Error) {
        this.userPresentable = userPresentable;
        this.error = error;
    }

    static UserPresentable(message: string): CommandException {
        return new CommandException(true, message);
    }

    static Internal(error: Error): CommandException {
        return new CommandException(false, error);
    }

    toString() {
        return this.error.toString();
    }
}
