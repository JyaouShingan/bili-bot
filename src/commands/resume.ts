import {BaseCommand, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class ResumeCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.RESUME;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
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