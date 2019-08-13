import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";

export class LeaveCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.LEAVE;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.activeConnection) return;
        guild.activeConnection.disconnect();
        guild.activeConnection = null;
        guild.activeDispatcher = null;
        guild.isPlaying = false;
        guild.clearPlaylist();
    }

    public helpMessage(): string {
        return 'Usage: leave';
    }
}
