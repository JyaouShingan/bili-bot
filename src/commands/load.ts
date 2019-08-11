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
        await guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            this.logger.info('Loading from default list');
            await this.load(message, guild);
        } else if (args.length === 1) {
            this.logger.info(`Loading from ${args[0]}`);
            await this.load(message, guild, args[0]);
        } else {
            throw CommandException.UserPresentable('Too many arguments, expected argument: 1');
        }
        message.reply("Finished loading from the playlist");
    }

    helpMessage(): string {
        return 'Usage: load <list-name>';
    }

    private async load(message: Message, guild: GuildManager, collection?: string) {
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
        playlistArray.pop(); // trivial element;
        message.reply('Start loading playlist');

        const promises = playlistArray.map((url) => {
            return getInfo(url).then((info) => {
                let song = new BilibiliSong(info, message.author);
                song.streamer.start();
                guild.playlist.push(song);
                if (!guild.activeConnection) {
                    message.member.voice.channel.join().then((connection) => {
                        guild.activeConnection = connection;
                    })
                }
            });
        })

        return Promise.all(promises);
    }
}
