import {GuildManager} from "../guild";
import MongoDB from "./db/service";
import {getLogger, Logger} from "../utils/logger";
import {BilibiliSong} from "./model/bilibili-song";
import {CommandException} from "../commands/base-command";
import {User} from "discord.js";
import {Connection, Model} from "mongoose";
import {SongDoc, SongSchema} from "./db/schemas/song";
import {PlaylistDoc, PlaylistSchema} from "./db/schemas/playlist";

export class GuildDataSource {
    protected readonly logger: Logger;
    private readonly guild: GuildManager;
    private db: Connection;
    private Song: Model<SongDoc>;
    private Playlist: Model<PlaylistDoc>;

    public constructor(guild: GuildManager) {
        this.logger = getLogger(`GuildDataSource-${guild.id}`);
        this.guild = guild;
    }

    private async setupDb(): Promise<void> {
        this.db = await MongoDB.getConnection(this.guild.id);
        this.Song = this.db.model('Song', SongSchema);
        this.Playlist = this.db.model('Playlist', PlaylistSchema);
    }

    public async saveToPlaylist(song: BilibiliSong, initiator: User, playlist?: string): Promise<void> {
        if (!this.db) await this.setupDb();
        const listname = playlist || 'default';

        const list = await this.getPlaylist(listname, initiator, true);

        // Check if this song is already in playlist
        let songDoc = await this.Song.findOne({uid: song.uid});
        if (songDoc && list.songs.includes(songDoc.id)) {
            throw CommandException.UserPresentable(`This song is already in playlist "${listname}"`);
        }

        // Otherwise insert the song if necessary and update playlist
        if (!songDoc) {
            songDoc = new this.Song({
                uid: song.uid,
                url: song.url,
                title: song.title,
                author: song.author,
                hmsDuration: song.hmsDuration,
                rawDuration: song.rawDuration,
                description: song.description,
                thumbnail: song.thumbnail
            });
            await songDoc.save();
        }

        await list.update({$push: {'songs': songDoc.id}});

        this.logger.info(`Song ${song.title} has saved to playlist ${listname}`);
    }

    public async loadFromPlaylist(initiator: User, playlist?: string): Promise<BilibiliSong[]> {
        if (!this.db) await this.setupDb();
        const listname = playlist || 'default';

        // Check if playlist exist
        const list = await this.getPlaylist(listname, initiator, false);
        if(!list) {
            throw CommandException.UserPresentable(`Playlist "${listname}" does not exist`);
        }

        const songsCursor = this.Song.find({
            '_id': {$in: list.songs}
        }).cursor();

        // Get all songs
        const songs: BilibiliSong[] = [];
        let songDoc: SongDoc;
        while((songDoc = await songsCursor.next())) {
            songs.push(songDoc.toSong(initiator));
        }

        this.logger.info(`Loaded songs from playlist ${listname}`);
        return songs;
    }

    private async getPlaylist(name: string, user: User, create: boolean = false): Promise<PlaylistDoc> {
        const result = await this.Playlist.findOne({name});
        if (result) {
            return result;
        } else if (create) {
            return new this.Playlist({
                name,
                creator: user.id,
                songs: []
            }).save();
        } else {
            return null;
        }
    }
}
