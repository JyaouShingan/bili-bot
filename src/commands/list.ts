import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class ListCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.LIST;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkMemberInChannel(message.member).then(() => {
            if (guild.playlist.length === 0) {
                const embed = new MessageEmbed()
                    .setDescription(`Pending playlist is empty`);
                guild.activeTextChannel.send(embed);
            } else {
                const playlistMessage = guild.playlist.map((song, index) => {
                    return `${index + 1}. ${song.title} [${song.initiator.toString()}]`;
                }).join('\n');
                const embed = new MessageEmbed()
                    .setTitle('Playlist:')
                    .setDescription(playlistMessage);
                guild.activeTextChannel.send(embed);
            }
        });
    }

    helpMessage(): string {
        return 'Usage: list';
    }
}
