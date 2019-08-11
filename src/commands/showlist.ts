import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import * as fs from "fs";
import {BilibiliSong} from "../bilibili-song";
import {getInfo} from "../utils/utils";

export class ShowlistCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.SHOWLIST;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        const playlist = args[0] || 'default';
        if (!fs.existsSync('./playlist')) {
            fs.mkdirSync('./playlist');
            message.reply('Nothing here yet');
            return Promise.resolve(null);
        }

        const playlistName = playlist ? `./playlist/${playlist}` : './playlist/default';
        if (!fs.existsSync(playlistName)) {
            message.reply('The playlist does not exist');
            return Promise.resolve(null);
        }
        while (guild.currentShowlistResult.length > 0) guild.currentShowlistResult.pop();
        const playlistArray = fs.readFileSync(playlistName).toString().split("\n");
        // pop the last empty element
        playlistArray.pop();
        if (playlistArray.length === 0) {
            message.reply('The playlist is empty');
            return;
        }
        const songs = playlistArray.map((url) => {
            return getInfo(url).then((info) => {
                return new BilibiliSong(info, message.author);
            });
        });

        const results = await Promise.all(songs);
        if (!results) return;

        for (const result of results) {
            guild.currentShowlistResult.push(result);
        }

        const resultMessage = guild.currentShowlistResult.map((song, index) => {
            return `${index + 1}. ${song.author} - ${song.title}`;
        });

        let embed = new MessageEmbed()
            .setTitle('Songs in this playlist:')
            .setDescription(resultMessage)
            .setFooter(`Use ${guild.commandPrefix}select [number] to play a song`);
        guild.activeTextChannel.send(embed);
        guild.previousCommand = "showlist";
    }

    helpMessage(): string {
        return 'Usage: showlist <list-name>';
    }
}
