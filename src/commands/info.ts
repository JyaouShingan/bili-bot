import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {Message, MessageEmbed} from "discord.js";
import {GuildManager} from "../guild";
import {BilibiliSong} from "../bilibili-song";
import * as utils from "../utils/utils";
import * as Promise from 'bluebird';

export class InfoCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.INFO;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        if (args.length === 0) {
            return guild.checkMemberInChannel(message.member).then(() => {
                this.processResult(message, guild, null);
            });
        } else {
            return utils.getInfo(args.shift()).then((info) => {
                this.processResult(message, guild, new BilibiliSong(info, message.author));
            });
        }
    }

    private processResult(message: Message, guild: GuildManager, song?: BilibiliSong): void {
        const currentSong = song || guild.currentSong;
        if (!currentSong) {
            throw CommandException.UserPresentable('Invalid command');
        }
        this.logger.info(`Queried song: ${currentSong.title}`);
        let embed = new MessageEmbed()
            .setTitle(currentSong.title)
            .setDescription(currentSong.description)
            .setFooter(currentSong.hmsDuration)
            .setThumbnail(currentSong.thumbnail)
            .setURL(currentSong.url)
            .setColor(0x00FF00);
        message.channel.send(embed);
    }

    helpMessage(): string {
        return 'Usage: info <video-url>';
    }
}
