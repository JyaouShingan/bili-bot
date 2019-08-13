import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class ClearCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.CLEAR;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.isPlaying) return;
        guild.clearPlaylist();
        message.channel.send(new MessageEmbed().setDescription('Playlist cleared'));
    }

    public helpMessage(): string {
        return 'Usage: clear'
    }
}
