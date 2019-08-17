import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";

export class PromoteCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.PROMOTE;
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

        const song = guild.queueManager.promoteSong(index);

        const embed = new MessageEmbed()
            .setDescription(`${song.title} has been promoted to top of the playlist`);
        guild.activeTextChannel.send(embed);

        // Dragon:
        message.react("🐲");
    }

    public helpMessage(): string {
        return 'Usage: promote [index]';
    }
}
