import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../app/guild";
import {Message} from "discord.js";

export class StopCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.STOP;
    }

    public async run(message: Message, guild: GuildManager, _args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (!guild.queueManager.isPlaying) {
            throw CommandException.UserPresentable("I'm not currently playing");
        } else {
            guild.queueManager.stop();
        }
    }

    public helpMessage(): string {
        return 'Usage: stop';
    }
}
