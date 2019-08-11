import {BaseCommand, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class ShuffleCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.SHUFFLE;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (!guild.isPlaying) return;
            for (let i = guild.playlist.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [guild.playlist[i], guild.playlist[j]] = [guild.playlist[j], guild.playlist[i]];
            }
            message.channel.send(new MessageEmbed().setDescription('Playlist shuffled'));
        });
    }

    helpMessage(): string {
        return 'Usage: shuffle'
    }
}