import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {Message, MessageEmbed} from "discord.js";
import {GuildManager} from "../app/guild";
import {BilibiliSong} from "../data/model/bilibili-song";
import * as utils from "../utils/utils";

export class InfoCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.INFO;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        if (args.length === 0) {
            guild.checkMemberInChannel(message.member);
            this.processResult(message, guild, null);
        } else {
            const info = await utils.getInfo(args.shift());
            this.processResult(message, guild, BilibiliSong.withInfo(info, message.author));
        }
    }

    private processResult(message: Message, guild: GuildManager, song?: BilibiliSong): void {
        const currentSong = song || guild.queueManager.currentSong;
        if (!currentSong) {
            throw CommandException.UserPresentable('Invalid command');
        }
        this.logger.info(`Queried song: ${currentSong.title}`);
        const embed = new MessageEmbed()
            .setTitle(currentSong.title)
            .setFooter(currentSong.hmsDuration)
            .setThumbnail(currentSong.thumbnail)
            .setURL(currentSong.url)
            .setColor(0x00FF00);

        if (currentSong.description.length <= 500) {
            embed.setDescription(currentSong.description)
        }
        message.channel.send(embed);
    }

    public helpMessage(): string {
        return 'Usage: info <video-url>';
    }
}
