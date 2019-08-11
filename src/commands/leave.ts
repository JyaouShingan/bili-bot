import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class LeaveCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.LEAVE;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        await guild.checkMemberInChannel(message.member);
        if (!guild.activeConnection) return;
        guild.activeConnection.disconnect();
        guild.activeConnection = null;
        guild.activeDispatcher = null;
        guild.isPlaying = false;
        guild.clearPlaylist();
    }

    helpMessage(): string {
        return 'Usage: leave';
    }
}
