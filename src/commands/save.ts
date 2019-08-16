import {BaseCommand} from "./base-command";
import {CommandType} from "./command-type";
import {GuildManager} from "../guild";
import {Message, MessageEmbed, User} from "discord.js";

export class SaveCommand extends BaseCommand {
    public type(): CommandType {
        return CommandType.SAVE;
    }

    public async run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        guild.checkMemberInChannel(message.member);
        if (args.length === 0) {
            this.logger.info('Saving to default list');
            await this.save(guild, message.author);
        } else if (args.length === 1) {
            this.logger.info(`Saving to ${args[0]}`);
            await this.save(guild, message.author, args[0]);
        } else if (args[0] == '-d') {
            this.logger.info(`Saving to ${args[0]} and Default playlist`);
            await this.save(guild, message.author);
            await this.save(guild, message.author, args[1]);
        }
    }

    public helpMessage(): string {
        return 'Usage: save <list-name>';
    }

    private async save(guild: GuildManager, user: User, collection?: string): Promise<void> {
        if (!guild.currentSong) {
            this.logger.warn('No song is playing');
            return;
        }

        await guild.dataManager.saveToPlaylist(guild.currentSong, user, collection);

        const playlistDescription = collection ? `playlist "${collection}"` : `default playlist`;
        guild.activeTextChannel.send(new MessageEmbed().setDescription(`${guild.currentSong.title} saved to ${playlistDescription}`));
    }
}
