import {BaseCommand, CommandException, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import * as api from "../bilibili-api";
import * as fs from "fs";
import {BilibiliSong} from "../bilibili-song";
import {getInfo} from "../utils/utils";

export class RandomCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.RANDOM;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            return this.doRandom(message, guild, args[0], args[1]);
        });
    }

    helpMessage(): string {
        return 'random <playlist|-b> <category>';
    }

    doRandom(message: Message, guild: GuildManager, source?: string, category?: string): Promise<void> {
        this.logger.info(`Random request - source: ${source}`);
        if (source) {
            if (source == '-b') {
                return this.doBilibiliRandom(message, guild, category);
            } else {
                return this.doLocalRandom(message, guild, source);
            }
        } else {
            return this.doLocalRandom(message, guild);
        }
    }

    doLocalRandom(message: Message, guild: GuildManager, playlist?: string): Promise<void> {
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

        return getInfo(playlistArray[randomIndex]).then((info) => {
            let song = new BilibiliSong(info, message.author);
            guild.playSong(message, song);
        });
    }

    doBilibiliRandom(message: Message, guild: GuildManager, category?:string): Promise<void> {
        category = category || 'music';

        return api.randomRanking(category, 'all').then((entity) => {
            let embed = new MessageEmbed()
                .setTitle('Random result:')
                .setDescription(`${entity.title} - ${entity.play} plays`);
            guild.activeTextChannel.send(embed);
            return getInfo(entity.getUrl());
        }).then((info) => {
            const song = new BilibiliSong(info, message.author);
            guild.playSong(message, song);
        });
    }
}