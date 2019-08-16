import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import * as api from "../data/datasources/bilibili-api";
import {BilibiliSong} from "../data/model/bilibili-song";
import {getInfo} from "../utils/utils";

export class RandomCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.RANDOM;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        await this.doRandom(message, guild, args[0], args[1]);
    }

    public helpMessage(): string {
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

    private static async doLocalRandom(message: Message, guild: GuildManager, playlist?: string): Promise<BilibiliSong> {
        const songs = await guild.dataManager.loadFromPlaylist(message.author, playlist);

        if (playlist) {
            message.reply(`Random selecting from ${playlist}`);
        } else {
            message.reply('Random selecting from default playlist');
        }
        const randomIndex = Math.floor(Math.random() * (songs.length - 1));

        return songs[randomIndex];
    }

    private static async doBilibiliRandom(message: Message, guild: GuildManager, category?: string): Promise<BilibiliSong> {
        category = category || 'music';

        const entity = await api.randomRanking(category, 'all');
        const embed = new MessageEmbed()
            .setTitle('Random result:')
            .setDescription(`${entity.title} - ${entity.play} plays`);
        guild.activeTextChannel.send(embed);
        const info = await getInfo(entity.getUrl());
        return BilibiliSong.withInfo(info, message.author);
    }
}
