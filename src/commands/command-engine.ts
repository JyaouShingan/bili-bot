import {GuildManager} from "../guild";
import {Command, CommandException} from "./base-command";
import {Commands} from "./commands";
import {Message} from "discord.js";
import {getLogger, Logger} from "../utils/logger";

export class CommandEngine {
    protected guild: GuildManager;
    protected commands: Map<string, Command>;
    protected logger: Logger;

    public constructor(guild: GuildManager) {
        this.guild = guild;
        this.commands = Commands;
        this.logger = getLogger('CommandEngine');
    }

    public async process(msg: Message, args: string[]): Promise<void> {
        const command = args.shift();
        if (this.commands.has(command)) {
            try {
                await this.commands.get(command).run(msg, this.guild, args)
            } catch (error) {
                this.logger.error(error);
                if (error instanceof CommandException && (error as CommandException).userPresentable) {
                    msg.reply(`Command failed: ${error}`);
                }
            }
        } else {
            msg.reply(`Invalid command ${command}`);
        }
    }
}
