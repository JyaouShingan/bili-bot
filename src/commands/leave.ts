import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class LeaveCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.LEAVE;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkMemberInChannel(message.member).then(() => {
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
