import {BaseCommand, CommandException, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import * as fs from "fs";
import {BilibiliSong} from "../bilibili-song";
import {getInfo} from "../utils/utils";

export class LoadCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.LOAD;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (args.length === 0) {
                this.logger.info('Loading from default list');
                this.load(message, guild);
            } else if (args.length === 1) {
                this.logger.info(`Loading from ${args[0]}`);
                this.load(message, guild, args[0]);
            }
        });
    }

    helpMessage(): string {
        return 'Usage: load <list-name>';
    }

    load(message: Message, guild: GuildManager, collection?: string) {
        if (!fs.existsSync('./playlist')) {
            fs.mkdirSync('./playlist');
            message.reply('Nothing here yet');
            return;
        }

        const playlistName = collection ? `./playlist/${collection}` : './playlist/default';
        if (!fs.existsSync(playlistName)) {
            message.reply('The playlist does not exist');
            return;
        }

        const playlistArray = fs.readFileSync(playlistName).toString().split("\n");
        message.reply('Start loading playlist');
        for (let index in playlistArray) {
            if (playlistArray[index] === '') continue;
            getInfo(playlistArray[index]).then((info) => {
                let song = new BilibiliSong(info, message.author);
                song.streamer.start();
                guild.playlist.push(song);
                if (guild.isPlaying) {
                    this.logger.info(`Song ${song.title} added to the queue`);
                } else if (!guild.activeConnection) {
                    message.member.voice.channel.join().then((connection) => {
                        guild.activeConnection = connection;
                    })
                } else {

                }
            }).catch((err) => {
                if (err) this.logger.info(`Failed loading: ${err}`);
            });
        }
    }

}