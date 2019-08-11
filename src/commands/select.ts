import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {getInfo} from "../utils/utils";
import {BilibiliSong} from "../bilibili-song";

export class SelectCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.SELECT;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        await guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            throw CommandException.UserPresentable(this.helpMessage());
        }
        const userIndex = parseInt(args.shift());
        if (isNaN(userIndex) || !Number.isInteger(userIndex)) {
            throw CommandException.UserPresentable(this.helpMessage());
        }
        const index = userIndex - 1;

        if (!guild.previousCommand) {
            throw CommandException.UserPresentable(`Invalid Operation: Please do ${guild.commandPrefix}search or ${guild.commandPrefix}showlist first`);
        }
        let searchBase = guild.previousCommand == "search" ? guild.currentSearchResult : guild.currentShowlistResult;
        if (index < 0 || index >= searchBase.length) {
            throw CommandException.UserPresentable(`The index you entered is out of bounds, please enter a number between ${1} and ${searchBase.length}`);
        }
        guild.previousCommand = null;
        const info = await getInfo(searchBase[index].getUrl())
        const song = new BilibiliSong(info, message.author);
        guild.playSong(message, song);
    }

    helpMessage(): string {
        return 'Usage: select [result-index]';
    }
}
