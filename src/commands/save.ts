import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import * as fs from "fs";

export class SaveCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.SAVE;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            this.logger.info('Saving to default list');
            await this.save(guild);
        } else if (args.length === 1) {
            this.logger.info(`Saving to ${args[0]}`);
            await this.save(guild, args[0]);
        }
    }

    helpMessage(): string {
        return 'Usage: save <list-name>';
    }

    async save(guild: GuildManager, collection?: string) {
        if (!guild.currentSong) {
            this.logger.warn('No song is playing');
            return;
        }
        
        await guild.datasource.saveToPlaylist(guild.currentSong, collection);

        // if (!fs.existsSync('./playlist')) {
        //     fs.mkdirSync('./playlist');
        // }
        //
        // const playlistName = collection ? `./playlist/${collection}` : './playlist/default';
        // if (!fs.existsSync(playlistName)) {
        //     fs.writeFileSync(playlistName, '');
        // }
        //
        // if (!guild.currentSong) {
        //     this.logger.info('Playlist created');
        //     return;
        // }
        //
        // const currentFile = fs.readFileSync(playlistName);
        // if (currentFile.includes(guild.currentSong.url)){
        //     guild.activeTextChannel.send('Already exists');
        //     return;
        // }
        //
        // fs.appendFile(playlistName, `${guild.currentSong.url}\n`, (err) => {
        //     if (err) this.logger.info(err);
        //     else guild.activeTextChannel.send('Added to playlist');
        // });
    }
}
