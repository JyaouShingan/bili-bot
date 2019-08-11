import {GuildManager} from "./guild";
import {Command} from "./commands/base-command";
import {Commands} from "./commands/commands";
import {Message} from "discord.js";

export class CommandEngine {
    guild: GuildManager;
    commands: Map<string, Command>;

    constructor(guild: GuildManager) {
        this.guild = guild;
        this.commands = Commands;
    }

    process(msg: Message, args: string[]) {
        const command = args.shift();
        if (this.commands.has(command)) {
            this.commands.get(command).run(msg, this.guild, args).catch((error) => {
                msg.reply(`Command failed: ${error}`);
            });
        } else {
            msg.reply(`Invalid command ${command}`);
        }
    }
}