import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {getInfo} from "../utils/utils";
import {BilibiliSong} from "../bilibili-song";

export class SelectCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.SELECT;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            throw CommandException.UserPresentable(this.helpMessage());
        }
        let index = parseInt(args.shift());
        if (!Number.isInteger(index)) {
            throw CommandException.UserPresentable(this.helpMessage());
        }
        index -= 1;

        if (!guild.previousCommand) {
            throw CommandException.UserPresentable(`Invalid Operation: Please do ${guild.commandPrefix}search or ${guild.commandPrefix}showlist first`);
        }
        const searchBase = guild.previousCommand == "search" ? guild.currentSearchResult : guild.currentShowlistResult;
        if (index < 0 || index >= searchBase.length) {
            throw CommandException.UserPresentable(`The index you entered is out of bounds, please enter a number between ${1} and ${searchBase.length}`);
        }
        guild.previousCommand = null;
        const info = await getInfo(searchBase[index].getUrl());
        const song = BilibiliSong.withInfo(info, message.author);
        await guild.playSong(message, song);
    }

    public helpMessage(): string {
        return 'Usage: select [result-index]';
    }
}
