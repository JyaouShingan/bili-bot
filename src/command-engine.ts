import {GuildManager} from "./guild";
import {Command, CommandException} from "./commands/base-command";
import {Commands} from "./commands/commands";
import {Message} from "discord.js";
import {getLogger, Logger} from "./logger";

export class CommandEngine {
    guild: GuildManager;
    commands: Map<string, Command>;
    logger: Logger;

    constructor(guild: GuildManager) {
        this.guild = guild;
        this.commands = Commands;
        this.logger = getLogger('CommandEngine');
    }

    process(msg: Message, args: string[]) {
        const command = args.shift();
        if (this.commands.has(command)) {
            this.commands.get(command).run(msg, this.guild, args).catch((error) => {
                this.logger.error(error);
                if (error instanceof CommandException && (error as CommandException).userPresentable) {
                    msg.reply(`Command failed: ${error}`);
                }
            });
        } else {
            msg.reply(`Invalid command ${command}`);
        }
    }
}
