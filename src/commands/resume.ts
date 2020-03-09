import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../app/guild";
import {Message} from "discord.js";

export class ResumeCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.RESUME;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (guild.queueManager.resume()) {
            message.reply('Audio resumed!');
        }
    }

    public helpMessage(): string {
        return 'Usage: resume';
    }
}
