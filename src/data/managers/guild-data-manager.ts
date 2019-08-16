import {GuildManager} from "../../guild";
import {getLogger, Logger} from "../../utils/logger";
import {BilibiliSong} from "../model/bilibili-song";
import {CommandException} from "../../commands/base-command";
import {User} from "discord.js";
import {SongDoc} from "../db/schemas/song";
import {SongDataSource} from "../datasources/song-datasource";
import {PlaylistDataSource} from "../datasources/playlist-datasource";

export class GuildDataManager {
    protected readonly logger: Logger;
    private readonly guild: GuildManager;
    private readonly songDataSource: SongDataSource;
    private readonly playlistDataSource: PlaylistDataSource;

    public constructor(guild: GuildManager) {
        this.logger = getLogger(`GuildDataSource-${guild.id}`);
        this.guild = guild;
        this.songDataSource = SongDataSource.getInstance();
        this.playlistDataSource = PlaylistDataSource.getInstance();
    }

    public async saveToPlaylist(song: BilibiliSong, initiator: User, playlist?: string): Promise<void> {
        const listname = playlist || 'default';

        const listDoc = await this.playlistDataSource.getOrCreate(listname, this.guild.id, initiator.id);

        // Check if this song is already in playlist
        let songDoc = await this.songDataSource.getOne(song.uid);
        if (songDoc && listDoc.songs.includes(songDoc.id)) {
            throw CommandException.UserPresentable(`This song is already in playlist "${listname}"`);
        }

        // Otherwise insert the song if necessary and update playlist
        if (!songDoc) {
            songDoc = await this.songDataSource.insert(song);
        }

        await this.playlistDataSource.save(songDoc, listDoc);
    }

    public async loadFromPlaylist(initiator: User, playlist?: string): Promise<BilibiliSong[]> {
        const listname = playlist || 'default';

        // Check if playlist exist
        const list = await this.playlistDataSource.get(listname, this.guild.id);
        if(!list) {
            throw CommandException.UserPresentable(`Playlist "${listname}" does not exist`);
        }

        // Get all songs
        const songs = (await this.songDataSource.getFromPlaylist(list)).map((doc: SongDoc): BilibiliSong => {
            return doc.toSong(initiator);
        });

        this.logger.info(`Loaded songs from playlist ${listname}`);
        return songs;
    }
}
