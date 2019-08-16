import {getLogger, Logger} from "../../utils/logger";
import {PlaylistDoc} from "../db/schemas/playlist";
import {SongDoc} from "../db/schemas/song";
import MongoDB from "../db/service";

export class PlaylistDataSource {
    private static instance: PlaylistDataSource;
    public static getInstance(): PlaylistDataSource {
        if (!PlaylistDataSource.instance) {
            if (!MongoDB.isConnected()) {
                throw new Error('Mongo DB is not connected');
            }
            PlaylistDataSource.instance = new PlaylistDataSource();
        }
        return PlaylistDataSource.instance;
    }

    protected readonly logger: Logger;

    private constructor() {
        this.logger = getLogger('PlaylistDataSource');
    }

    public async get(name: string, guildId: string): Promise<PlaylistDoc> {
        this.logger.verbose(`Querying playlist ${name} in ${guildId}`);
        return MongoDB.Playlist.findOne({name, guildId});
    }

    private async create(name: string, guildId: string, creator: string): Promise<PlaylistDoc> {
        this.logger.verbose(`Playlist ${name} created in ${guildId}`);
        const result = await new MongoDB.Playlist({
            name,
            creator,
            songs: [],
            guildId
        }).save();
        return result;
    }

    public async getOrCreate(name: string, guildId: string, creator: string): Promise<PlaylistDoc> {
        let playlist = await this.get(name, guildId);
        if (!playlist) {
            playlist = await this.create(name, guildId, creator);
        }
        return playlist;
    }

    public async save(song: SongDoc, playlist: PlaylistDoc): Promise<void> {
        this.logger.verbose(`Saving song ${song.title} to playlist ${playlist.name}`);
        await playlist.updateOne({
            $addToSet: {'songs': song.id}
        });
    }
}
