import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class PromoteCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.PROMOTE;
    }

    async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            throw CommandException.UserPresentable(this.helpMessage());
        }

        let index = parseInt(args.shift());
        if (!Number.isInteger(index)) {
            throw CommandException.UserPresentable(this.helpMessage());
        }
        index -= 1;

        if (index < 0 || index >= guild.playlist.length) {
            throw CommandException.UserPresentable(`The index you entered is out of bounds, please enter a number between ${1} and ${guild.playlist.length}`);
        }

        const song = guild.playlist.splice(index)[0];
        guild.playlist.unshift(song);

        const embed = new MessageEmbed()
            .setDescription(`${song.title} has been promoted to top of the playlist`);
        guild.activeTextChannel.send(embed);

        // Dragon:
        message.react("🐲");
    }

    helpMessage(): string {
        return 'Usage: promote [index]';
    }
}
