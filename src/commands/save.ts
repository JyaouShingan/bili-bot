import {BaseCommand, CommandException, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import * as fs from "fs";

export class SaveCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.SAVE;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (args.length === 0) {
                this.logger.info('Saving to default list');
                this.save(guild);
            } else if (args.length === 1) {
                this.logger.info(`Saving to ${args[0]}`);
                this.save(guild, args[0]);
            }
        });
    }

    helpMessage(): string {
        return 'Usage: save <list-name>';
    }

    save(guild: GuildManager, collection?: string): void {
        if (!fs.existsSync('./playlist')) {
            fs.mkdirSync('./playlist');
        }

        const playlistName = collection ? `./playlist/${collection}` : './playlist/default';
        if (!fs.existsSync(playlistName)) {
            fs.writeFileSync(playlistName, '');
        }

        if (!guild.currentSong) {
            this.logger.info('Playlist created');
            return;
        }

        const currentFile = fs.readFileSync(playlistName);
        if (currentFile.includes(guild.currentSong.url)){
            guild.activeTextChannel.send('Already exists');
            return;
        }

        fs.appendFile(playlistName, `${guild.currentSong.url}\n`, (err) => {
            if (err) this.logger.info(err);
            else guild.activeTextChannel.send('Added to playlist');
        });
    }
}