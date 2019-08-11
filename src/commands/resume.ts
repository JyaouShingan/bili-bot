import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class ResumeCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.RESUME;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkMemberInChannel(message.member).then(() => {
            if (guild.activeDispatcher) {
                guild.activeDispatcher.resume();
                message.reply('Audio resumed!');
            }
        })
    }

    helpMessage(): string {
        return 'Usage: resume';
    }
}
