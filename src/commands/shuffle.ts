import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import {shuffle} from "../utils/utils";

export class ShuffleCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.SHUFFLE;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.isPlaying) return;
        shuffle(guild.playlist);
        message.channel.send(new MessageEmbed().setDescription('Playlist shuffled'));
    }

    public helpMessage(): string {
        return 'Usage: shuffle'
    }
}
