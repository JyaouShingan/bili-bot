import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import * as api from "../bilibili-api";
import * as fs from "fs";
import {BilibiliSong} from "../bilibili-song";
import {getInfo} from "../utils/utils";
import * as youtubedl from "youtube-dl";

export class RandomCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.RANDOM;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        await this.doRandom(message, guild, args[0], args[1]);
    }

    helpMessage(): string {
        return 'random <playlist|-b> <category>';
    }

    private async doRandom(message: Message, guild: GuildManager, source?: string, category?: string): Promise<void> {
        this.logger.info(`Random request - source: ${source}`);
        let song: BilibiliSong;
        if (source) {
            if (source == '-b') {
                song = await RandomCommand.doBilibiliRandom(message, guild, category);
            } else {
                song = await RandomCommand.doLocalRandom(message, guild, source);
            }
        } else {
            song = await RandomCommand.doLocalRandom(message, guild);
        }
        await guild.playSong(message, song);
    }

    private static async doLocalRandom(message: Message, guild: GuildManager, playlist?: string) {
        const songs = await guild.datasource.loadFromPlaylist(message.author, playlist);

        if (playlist) {
            message.reply(`Random selecting from ${playlist}`);
        } else {
            message.reply('Random selecting from default playlist');
        }
        const randomIndex = Math.floor(Math.random() * (songs.length - 1));

        return songs[randomIndex];
    }

    private static async doBilibiliRandom(message: Message, guild: GuildManager, category?:string) {
        category = category || 'music';

        const entity = await api.randomRanking(category, 'all');
        let embed = new MessageEmbed()
            .setTitle('Random result:')
            .setDescription(`${entity.title} - ${entity.play} plays`);
        guild.activeTextChannel.send(embed);
        const info = await getInfo(entity.getUrl());
        return BilibiliSong.withInfo(info, message.author);
    }
}
