import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../app/guild";
import {Message} from "discord.js";
import {getInfo} from "../utils/utils";
import {BilibiliSong} from "../data/model/bilibili-song";

export class PlayCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.PLAY;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            throw this.helpMessage();
        }
        const info = await getInfo(args.shift());
        const song = await BilibiliSong.withInfo(info, message.author);
        this.logger.info(`Playing: ${song.title}`);

        await guild.joinChannel(message);
        guild.queueManager.pushSong(song);
    }

    public helpMessage(): string {
        return 'Usage: play [video_url]'
    }
}
