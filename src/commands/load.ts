import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {getInfo, getInfoWithArg, shuffle} from "../utils/utils";
import { BilibiliSong } from "../bilibili-song";

export class LoadCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.LOAD;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            this.logger.info('Loading from default list');
            await LoadCommand.load(message, guild);
        } else if (args.length === 1) {
            this.logger.info(`Loading from ${args[0]}`);
            await LoadCommand.load(message, guild, args[0]);
        } else if (args.length === 3 && args[0] == '-y') {
            this.logger.info('Loading from youtube playlist');
            await this.loadYoutubeList(message, guild, args[1], args[2]);
        } else {
            throw CommandException.UserPresentable('Invalid arguments number, please see usage');
        }
    }

    public helpMessage(): string {
        return 'Usage: load [-y <youtube-list-url>] <list-name>';
    }

    private static async load(message: Message, guild: GuildManager, collection?: string): Promise<void> {
        const songs = await guild.datasource.loadFromPlaylist(message.author, collection);
        shuffle(songs);

        for (const song of songs) {
            song.streamer.start();
            guild.playlist.push(song);
        }

        if (songs.length === 0) {
            message.reply('Playlist is empty');
            return;
        }
        message.reply('Playlist successfully loaded');

        if (!guild.activeConnection) {
            await guild.joinChannel(message);
            guild.playNext();
        } else {
            if (!guild.isPlaying) {
                guild.playNext();
            }
        }
    }

    private async loadYoutubeList(
        message: Message,
        guild: GuildManager,
        youtubeListUrl: string,
        collection?: string,
    ): Promise<void> {
        const result = await getInfoWithArg(youtubeListUrl, ['--flat-playlist', '-i']);
        if (Array.isArray(result)) {
            message.reply("Start loading from youtube playlist, please be patient...");
            // doing this sync'ly now, might change later
            for (const song of result) {
                this.logger.info(`Now loading song: ${song.url}`);
                if (!song.url) continue;
                const info = await getInfo(song.url);
                await guild.datasource.saveToPlaylist(
                    BilibiliSong.withInfo(info, message.author), message.author, collection
                );
            }
            message.reply("Successfully loaded youtube playlist");
        } else {
            message.reply("Please use a valid youtube playlist");
        }
    }
}
