import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class NextCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.NEXT;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (guild.queueManager.isListEmpty()) {
            throw CommandException.UserPresentable('Current playlist is empty');
        } else {
            guild.queueManager.next();
        }
    }

    public helpMessage(): string {
        return 'Usage: next';
    }
}
