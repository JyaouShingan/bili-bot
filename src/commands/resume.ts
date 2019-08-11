import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class ResumeCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.RESUME;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (guild.activeDispatcher) {
            guild.activeDispatcher.resume();
            message.reply('Audio resumed!');
        }
    }

    helpMessage(): string {
        return 'Usage: resume';
    }
}
