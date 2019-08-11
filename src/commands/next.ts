import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class NextCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.NEXT;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (guild.playlist.length === 0) {
            throw CommandException.UserPresentable('Current playlist is empty');
        } else {
            if (guild.activeDispatcher) {
                guild.activeDispatcher.destroy();
            }
            guild.playNext();
        }
    }

    helpMessage(): string {
        return 'Usage: next';
    }
}
