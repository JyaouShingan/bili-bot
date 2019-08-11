import {BaseCommand, CommandException, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class NextCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.NEXT;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (guild.playlist.length === 0) {
                throw CommandException.UserPresentable('Current playlist is empty');
            } else {
                if (guild.activeDispatcher) {
                    guild.activeDispatcher.destroy();
                }
                guild.playNext();
            }
        })
    }

    helpMessage(): string {
        return 'Usage: next';
    }
}