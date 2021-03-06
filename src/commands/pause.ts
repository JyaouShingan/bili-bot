import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {Message} from "discord.js";
import {GuildManager} from "../app/guild";

export class PauseCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.PAUSE;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (guild.queueManager.pause()) {
            message.reply('Audio paused!');
        }
    }

    public helpMessage(): string {
        return 'Usage: pause';
    }
}
