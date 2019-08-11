import {CommandType, BaseCommand} from "./base-command";
import {Message, MessageEmbed} from "discord.js";
import {GuildManager} from "../guild";
import {BilibiliSong} from "../bilibili-song";
import * as utils from "../utils/utils";
import * as Promise from 'bluebird';

export class InfoCommand extends BaseCommand {
    type() {
        return CommandType.INFO;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        if (args.length === 0) {
            if (guild.checkUserInChannel(message)) {
                this.processResult(message, guild, null);
            }
            return Promise.resolve();
        } else {
            return utils.getInfo(args.shift()).then((info) => {
                this.processResult(message, guild, new BilibiliSong(info, message.author));
            });
        }
    }

    processResult(message: Message, guild: GuildManager, song?: BilibiliSong): void {
        const currentSong = song || guild.currentSong;
        if (!currentSong) {
            message.reply("Invalid Operation");
            return;
        }
        this.logger.info(`Info command - ${currentSong.title}`);
        let embed = new MessageEmbed()
            .setTitle(currentSong.title)
            .setDescription(currentSong.description)
            .setFooter(currentSong.hmsDuration)
            .setThumbnail(currentSong.thumbnail)
            .setURL(currentSong.url)
            .setColor(0x00FF00);
        message.channel.send(embed);
    }
}