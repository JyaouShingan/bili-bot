import {BaseCommand, CommandException, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class StopCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.STOP;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (!guild.isPlaying) {
                throw CommandException.UserPresentable("I'm not currently playing");
            } else {
                guild.isPlaying = false;
                if (guild.activeDispatcher) {
                    guild.activeDispatcher.destroy();
                }
                guild.currentSong = null;
            }
        });
    }

    helpMessage(): string {
        return 'Usage: stop';
    }
}