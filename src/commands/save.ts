import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed, User} from "discord.js";
import {getInfo} from "../utils/utils";
import {BilibiliSong} from "../bilibili-song";
import * as fs from 'fs';

export class SaveCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.SAVE;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args[0] == '-migrate') {
            this.logger.info(`Migrating from ${args[1] || 'default'}`);
            await this.migrate(guild, message.author, args[1]);
            return;
        }
        if (!guild.currentSong) {
            this.logger.warn('No song is playing');
            return;
        }
        if (args.length === 0) {
            this.logger.info('Saving to default list');
            await this.save(guild.currentSong, guild, message.author);
        } else if (args.length === 1) {
            this.logger.info(`Saving to ${args[0]}`);
            await this.save(guild.currentSong, guild, message.author, args[0]);
        }
    }

    public helpMessage(): string {
        return 'Usage: save <list-name>';
    }

    private async save(song: BilibiliSong, guild: GuildManager, user: User, collection?: string): Promise<void> {
        await guild.datasource.saveToPlaylist(song, user, collection);

        const playlistDescription = collection ? `playlist "${collection}"` : `default playlist`;
        guild.activeTextChannel.send(new MessageEmbed().setDescription(`${guild.currentSong.title} saved to ${playlistDescription}`));
        this.logger.info(`${guild.currentSong.title} saved to ${playlistDescription}`);
    }

    private async migrate(guild: GuildManager, user: User, collection?: string): Promise<void[]> {
        if (!fs.existsSync('./playlist')) {
            fs.mkdirSync('./playlist');
            return;
        }

        const playlistName = collection ? `./playlist/${collection}` : './playlist/default';
        if (!fs.existsSync(playlistName)) {
            guild.activeTextChannel.send('The playlist does not exist');
            return;
        }

        const playlistArray = fs.readFileSync(playlistName).toString().split("\n");
        playlistArray.pop(); // trivial element;
        guild.activeTextChannel.send('Start loading legacy playlist');

        return Promise.all(playlistArray.map((url): Promise<void> => {
            return getInfo(url).then((info): Promise<void> => {
                const song = BilibiliSong.withInfo(info, null);
                return this.save(song, guild, user, collection);
            });
        }));
    }
}
