import {BaseCommand, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class LeaveCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.LEAVE;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (!guild.activeConnection) return;
            guild.activeConnection.disconnect();
            guild.activeConnection = null;
            guild.activeDispatcher = null;
            guild.isPlaying = false;
            guild.clearPlaylist();
        })
    }

    helpMessage(): string {
        return 'Usage: leave';
    }
}