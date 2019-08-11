import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {Message} from "discord.js";
import {GuildManager} from "../guild";

export class PauseCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.PAUSE;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (guild.activeDispatcher) {
            guild.activeDispatcher.pause();
            message.reply('Audio paused!');
        }
    }

    helpMessage(): string {
        return 'Usage: pause';
    }
}
