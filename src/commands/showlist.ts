import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../app/guild";
import {Message, MessageEmbed} from "discord.js";

export class ShowlistCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.SHOWLIST;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        const playlist = args[0] || 'default';

        const songs = await guild.dataManager.loadFromPlaylist(message.author, playlist);

        while (guild.currentShowlistResult.length > 0) guild.currentShowlistResult.pop();
        if (songs.length === 0) {
            message.reply('The playlist is empty');
            return;
        }

        guild.setCurrentShowlistResult(songs);

        const resultMessage = guild.currentShowlistResult.map((song, index): string => {
            return `${index + 1}. ${song.author} - ${song.title}`;
        });

        const embed = new MessageEmbed()
            .setTitle('Songs in this playlist:')
            .setDescription(resultMessage)
            .setFooter(`Use ${guild.commandPrefix}select [number] to play a song`);
        guild.activeTextChannel.send(embed);
        guild.setPreviousCommand("showlist");
    }

    public helpMessage(): string {
        return 'Usage: showlist <list-name>';
    }
}
