import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import * as fs from "fs";
import {BilibiliSong} from "../bilibili-song";
import {getInfo} from "../utils/utils";

export class ShowlistCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.SHOWLIST;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        const playlist = args[0] || 'default';

        const songs = await guild.datasource.loadFromPlaylist(message.author, playlist);

        while (guild.currentShowlistResult.length > 0) guild.currentShowlistResult.pop();
        if (songs.length === 0) {
            message.reply('The playlist is empty');
            return;
        }

        guild.currentShowlistResult = songs;

        const resultMessage = guild.currentShowlistResult.map((song, index) => {
            return `${index + 1}. ${song.author} - ${song.title}`;
        });

        let embed = new MessageEmbed()
            .setTitle('Songs in this playlist:')
            .setDescription(resultMessage)
            .setFooter(`Use ${guild.commandPrefix}select [number] to play a song`);
        guild.activeTextChannel.send(embed);
        guild.previousCommand = "showlist";
    }

    helpMessage(): string {
        return 'Usage: showlist <list-name>';
    }
}
