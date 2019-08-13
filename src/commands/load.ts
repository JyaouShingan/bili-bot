import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {shuffle} from "../utils/utils";

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
        } else {
            throw CommandException.UserPresentable('Too many arguments, expected argument: 1');
        }
    }

    public helpMessage(): string {
        return 'Usage: load <list-name>';
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
}
