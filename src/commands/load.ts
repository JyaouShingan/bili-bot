import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import * as fs from "fs";
import {BilibiliSong} from "../bilibili-song";
import {getInfo} from "../utils/utils";

export class LoadCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.LOAD;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            this.logger.info('Loading from default list');
            await this.load(message, guild);
        } else if (args.length === 1) {
            this.logger.info(`Loading from ${args[0]}`);
            await this.load(message, guild, args[0]);
        } else {
            throw CommandException.UserPresentable('Too many arguments, expected argument: 1');
        }
    }

    helpMessage(): string {
        return 'Usage: load <list-name>';
    }

    private async load(message: Message, guild: GuildManager, collection?: string) {
        message.reply('Start loading playlist');
        const songs = await guild.datasource.loadFromPlaylist(message.author, collection);
        for (const song of songs) {
            song.streamer.start();
            guild.playlist.push(song);
        }
        message.reply("Finished loading from the playlist");

        if (songs.length === 0) {
            return;
        }

        if (!guild.activeConnection) {
            message.member.voice.channel.join().then((connection) => {
                guild.activeConnection = connection;
                guild.playNext();
            })
        } else {
            guild.playNext();
        }
    }
}
