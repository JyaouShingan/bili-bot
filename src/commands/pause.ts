import {BaseCommand, CommandType} from "./base-command";
import {Message} from "discord.js";
import {GuildManager} from "../guild";
import * as Promise from "bluebird";

export class PauseCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.PAUSE;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (guild.activeDispatcher) {
                guild.activeDispatcher.pause();
                message.reply('Audio paused!');
            }
        })
    }

    helpMessage(): string {
        return 'Usage: pause';
    }
}