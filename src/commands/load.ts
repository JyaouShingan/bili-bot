import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {getInfoWithArg, shuffle} from "../utils/utils";
import {BilibiliSong} from "../data/model/bilibili-song";

export class LoadCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.LOAD;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            this.logger.info('Loading from default list');
            await this.load(message, guild);
        } else if (args.length === 1) {
            if (args[0] == '-s') {
                this.logger.info(`Loading from default synchronously`);
                await this.load(message, guild, args[0]);
            } else {
                this.logger.info(`Loading from ${args[0]}`);
                await this.load(message, guild, args[0]);
            }
        } else if (args.length === 2 && args[0] == '-s') {
            this.logger.info(`Loading from ${args[1]}`);
            await this.load(message, guild, args[1], true);
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

    private async load(message: Message, guild: GuildManager, collection?: string, isSync: boolean = false): Promise<void> {
        const songs = await guild.datasource.loadFromPlaylist(message.author, collection);
        shuffle(songs);

        if (isSync || (songs.length > 5)) {
            this.logger.info("Sync mode");
            for (const song of songs) {
                guild.playlist.push(song);
            }
        } else {
            for (const song of songs) {
                song.streamer.start();
                guild.playlist.push(song);
            }
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
                try {
                    const info = await getInfoWithArg(song.url, ['-i']);
                    await guild.datasource.saveToPlaylist(
                        BilibiliSong.withInfo(info, message.author), message.author, collection
                    );
                } catch (err) {
                    // Skip duplicated error on batch load
                    this.logger.warn(err.toString());
                }
            }
            message.reply("Successfully loaded youtube playlist");
        } else {
            message.reply("Please use a valid youtube playlist");
        }
    }
}
