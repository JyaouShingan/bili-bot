import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../app/guild";
import {Message, MessageEmbed} from "discord.js";

export class ShuffleCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.SHUFFLE;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.queueManager.isPlaying) return;
        guild.queueManager.doShuffle();
        message.channel.send(new MessageEmbed().setDescription('Playlist shuffled'));
    }

    public helpMessage(): string {
        return 'Usage: shuffle'
    }
}
