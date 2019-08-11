import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class ShuffleCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.SHUFFLE;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.isPlaying) return;
        for (let i = guild.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [guild.playlist[i], guild.playlist[j]] = [guild.playlist[j], guild.playlist[i]];
        }
        message.channel.send(new MessageEmbed().setDescription('Playlist shuffled'));
    }

    helpMessage(): string {
        return 'Usage: shuffle'
    }
}
