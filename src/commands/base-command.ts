import {Logger, getLogger} from "../utils/logger";
import {Message} from "discord.js";
import {GuildManager} from "../guild";
import {CommandType} from "./command-type";

export interface Command {
    type(): CommandType;
    run(message: Message, guild: GuildManager, args?: string[]): Promise<void>;
    helpMessage(): string;
}

export class BaseCommand implements Command {
    protected readonly logger: Logger;

    public constructor() {
        this.logger = getLogger(`Command - ${this.type()}`);
    }

    public type(): CommandType {
        return CommandType.INVALID;
    }

    public async run(_message: Message, _guild: GuildManager, _args?: string[]): Promise<void> {
        // Noop
        return;
    }

    public helpMessage(): string {
        throw new Error('helpMessage() requires override');
    }
}

export class CommandException {
    public userPresentable: boolean;
    public error: string|Error;

    public constructor(userPresentable: boolean, error: string|Error) {
        this.userPresentable = userPresentable;
        this.error = error;
    }

    public static UserPresentable(message: string): CommandException {
        return new CommandException(true, message);
    }

    public static Internal(error: Error): CommandException {
        return new CommandException(false, error);
    }

    public toString(): string {
        return this.error.toString();
    }
}
