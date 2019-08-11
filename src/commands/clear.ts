import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class ClearCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.CLEAR;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.isPlaying) return;
        guild.clearPlaylist();
        message.channel.send(new MessageEmbed().setDescription('Playlist cleared'));
    }

    helpMessage(): string {
        return 'Usage: clear'
    }
}
