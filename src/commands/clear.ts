import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class ClearCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.CLEAR;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkMemberInChannel(message.member).then(() => {
            if (!guild.isPlaying) return;
            guild.clearPlaylist();
            message.channel.send(new MessageEmbed().setDescription('Playlist cleared'));
        });
    }

    helpMessage(): string {
        return 'Usage: clear'
    }
}
