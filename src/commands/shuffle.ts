import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import {shuffle} from "../utils/utils";

export class ShuffleCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.SHUFFLE;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.isPlaying) return;
        shuffle(guild.playlist);
        message.channel.send(new MessageEmbed().setDescription('Playlist shuffled'));
    }

    helpMessage(): string {
        return 'Usage: shuffle'
    }
}
