import {BaseCommand, CommandException, CommandType} from "./base-command";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message} from "discord.js";
import {getInfo} from "../utils/utils";
import {BilibiliSong} from "../bilibili-song";

export class SelectCommand extends BaseCommand {
    protected type(): CommandType {
        return CommandType.SELECT;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkUserInChannel(message).then(() => {
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
            return getInfo(searchBase[index].getUrl())
        }).then((info) => {
            const song = new BilibiliSong(info, message.author);
            guild.playSong(message, song);
        });
    }

    helpMessage(): string {
        return 'Usage: select [result-index]';
    }
}