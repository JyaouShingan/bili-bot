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
        await guild.checkMemberInChannel(message.member);
        await this.doRandom(message, guild, args[0], args[1]);
    }

    helpMessage(): string {
        return 'random <playlist|-b> <category>';
    }

    private async doRandom(message: Message, guild: GuildManager, source?: string, category?: string): Promise<void> {
        this.logger.info(`Random request - source: ${source}`);
        let songInfo: youtubedl.Info;
        if (source) {
            if (source == '-b') {
                songInfo = await this.doBilibiliRandom(message, guild, category);
            } else {
                songInfo = await this.doLocalRandom(message, guild, source);
            }
        } else {
            songInfo = await this.doLocalRandom(message, guild);
        }

        let song = new BilibiliSong(songInfo, message.author);
        guild.playSong(message, song);
    }

    private async doLocalRandom(message: Message, guild: GuildManager, playlist?: string): Promise<youtubedl.Info> {
        const defaultList = "./playlist/default";
        const list = playlist ? `./playlist/${playlist}` : defaultList;
        if (!fs.existsSync(list)) {
            throw CommandException.UserPresentable('Playlist does not exist');
        }
        const playlistArray = fs.readFileSync(list).toString().split("\n");

        if (playlist) {
            message.reply(`Random selecting from ${playlist}`);
        } else {
            message.reply('Random selecting from default playlist');
        }
        const randomIndex = Math.floor(Math.random() * (playlistArray.length - 1));

        return getInfo(playlistArray[randomIndex]);
    }

    private async doBilibiliRandom(message: Message, guild: GuildManager, category?:string): Promise<youtubedl.Info> {
        category = category || 'music';

        return api.randomRanking(category, 'all').then((entity) => {
            let embed = new MessageEmbed()
                .setTitle('Random result:')
                .setDescription(`${entity.title} - ${entity.play} plays`);
            guild.activeTextChannel.send(embed);
            return getInfo(entity.getUrl());
        });
    }
}
