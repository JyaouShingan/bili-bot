import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {getInfo} from "../utils/utils";
import {BilibiliSong} from "../bilibili-song";

export class PlayCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.PLAY;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        await guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            throw this.helpMessage();
        }
        const info = await getInfo(args.shift());
        const song = new BilibiliSong(info, message.author);
        this.logger.info(`Playing: ${song.title}`);
        guild.playSong(message, song);
    }

    helpMessage(): string {
        return 'Usage: play [video_url]'
    }
}
