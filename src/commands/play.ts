import {BaseCommand, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {getInfo} from "../utils/utils";
import {BilibiliSong} from "../bilibili-song";

export class PlayCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.PLAY;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
            if (args.length === 0) {
                throw this.helpMessage();
            } else {
                return getInfo(args.shift());
            }
        }).then((info) => {
            const song = new BilibiliSong(info, message.author);
            this.logger.info(`Playing: ${song.title}`);
            guild.playSong(message, song);
        });
    }

    helpMessage(): string {
        return 'Usage: play [video_url]'
    }
}