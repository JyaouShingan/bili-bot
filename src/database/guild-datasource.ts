import {GuildManager} from "../guild";
import {Db as Database} from "mongodb";
import {MongoDB} from "./mongo-service";
import {getLogger, Logger} from "../logger";
import {BilibiliSong} from "../bilibili-song";
import {CommandException} from "../commands/base-command";
import {User} from "discord.js";

export class GuildDataSource {
    readonly logger: Logger;
    readonly guild: GuildManager;
    readonly mongoService = MongoDB;
    readonly db: Database;

    constructor(guild: GuildManager) {
        this.logger = getLogger(`GuildDataSource-${guild.id}`);
        this.guild = guild;
        this.db = this.mongoService.client.db(this.guild.id);
    }

    async saveToPlaylist(song: BilibiliSong, playlist?: string) {
        const listname = playlist || 'default';
        const collection = await this.getPlaylistCollection(listname, true);
        await collection.insertOne({
            _id: song.uid,
            url: song.url,
            title: song.title,
            author: song.author,
            description: song.description,
            thumbnail: song.thumbnail,
            rawDuration: song.rawDuration,
            hmsDuration: song.hmsDuration
        });
        this.logger.info(`Song ${song.title} has saved to playlist ${listname}`);
    }

    async loadFromPlaylist(initiator: User, playlist?: string) {
        const listname = playlist || 'default';
        const collection = await this.getPlaylistCollection(listname);
        if (!collection) {
            throw CommandException.UserPresentable('The playlist does not exist');
        }
        const songs = await collection.find({}).map((record) => {
            return BilibiliSong.withRecord(record, initiator);
        }).toArray();
        this.logger.info(`Loaded songs from playlist ${listname}`);
        return songs;
    }

    private async getPlaylistCollection(playlist: string, create: boolean = false) {
        try {
            return this.db.collection(`playlist-${playlist}`);
        } catch (error) {
            if (create) {
                this.logger.info(`Creating collection playlist-${playlist}`);
                return await this.createAndSetupPlaylist(playlist);
            }
            return null;
        }
    }

    private async createAndSetupPlaylist(playlist: string) {
        return await this.db.createCollection(`playlist-${playlist}`, {
           'validator': {
               'uid': {'$type': "string"},
               'url': {'$type': "string"},
               'title': {'$type': "string"},
               'author': {'$type': "string"},
               'hmsDuration': {'$type': "string"},
               'rawDuration': {'$type': "double"}
           }
        });
    }
}
