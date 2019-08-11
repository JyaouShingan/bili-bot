import {BaseCommand, CommandException} from "./base-command";
import {CommandType} from "./command-type";
import * as Promise from "bluebird";
import {GuildManager} from "../guild";
import {Message, MessageEmbed} from "discord.js";
import * as api from "../bilibili-api";

export class SearchCommand extends BaseCommand {
    type(): CommandType {
        return CommandType.SEARCH;
    }

    run(message: Message, guild: GuildManager, args?: string[]): Promise<void> {
        return guild.checkMemberInChannel(message.member).then(() => {
            if (args.length === 0) {
                throw CommandException.UserPresentable(this.helpMessage());
            }

            const keyword = args.shift();
            let limit = parseInt(args.shift());
            limit = limit ? limit : 20;

            return api.search(keyword, limit);
        }).then((entities) => {
            guild.currentSearchResult = null;
            if (entities.length === 0) {
                let embed = new MessageEmbed()
                    .setDescription("No result found");
                guild.activeTextChannel.send(embed);
            } else {
                guild.currentSearchResult = entities;
                const resultMessage = entities.map((entity, index) => {
                    return `${index + 1}. ${entity.title} - ${entity.play} plays`;
                });
                let embed = new MessageEmbed()
                    .setTitle('Search result:')
                    .setDescription(resultMessage)
                    .setFooter(`Use ${guild.commandPrefix}select [number] to play a song`);
                guild.activeTextChannel.send(embed);
                guild.previousCommand = "search";
            }
        })
    }

    helpMessage(): string {
        return 'Usage: search [keyword]';
    }
}
