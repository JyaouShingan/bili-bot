import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class StopCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.STOP;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkMemberInChannel(message.member).then(() => {
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
