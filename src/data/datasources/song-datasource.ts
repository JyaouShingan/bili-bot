import {getLogger, Logger} from "../../utils/logger";
import {SongDoc} from "../db/schemas/song";
import {PlaylistDoc} from "../db/schemas/playlist";
import {BilibiliSong} from "../model/bilibili-song";
import MongoDB from "../db/service";

export class SongDataSource {
    private static instance: SongDataSource;
    public static getInstance(): SongDataSource {
        if (!SongDataSource.instance) {
            if (!MongoDB.isConnected()) {
                throw new Error('Mongo DB is not connected');
            }
            SongDataSource.instance = new SongDataSource();
        }
        return SongDataSource.instance;
    }

    protected readonly logger: Logger;

    private constructor() {
        this.logger = getLogger('SongDataSource');
    }

    public async exist(uid: string): Promise<boolean> {
        this.logger.verbose(`Checking existance of id=${uid}`);
        const result = await MongoDB.Song.findOne({uid: uid});
        return result !== null && result !== undefined;
    }

    public async getOne(uid: string): Promise<SongDoc> {
        this.logger.verbose(`Querying song with id=${uid}`);
        return MongoDB.Song.findOne({uid: uid});
    }

    public async getFromPlaylist(playlist: PlaylistDoc): Promise<SongDoc[]> {
        this.logger.verbose(`Querying songs from playlist ${playlist.name} in ${playlist.guildId}`);
        const cursor = MongoDB.Song.find({
            '_id': {$in: playlist.songs}
        }).cursor();
        const result: SongDoc[] = [];
        for (let song = await cursor.next(); song; song = await cursor.next()) {
            result.push(song);
        }
        return result;
    }

    public async insert(song: BilibiliSong | SongDoc): Promise<SongDoc> {
        this.logger.verbose(`Saving song ${song.uid}`);
        if (song instanceof BilibiliSong) {
            return new MongoDB.Song({
                uid: song.uid,
                url: song.url,
                title: song.title,
                author: song.author,
                hmsDuration: song.hmsDuration,
                rawDuration: song.rawDuration,
                description: song.description,
                thumbnail: song.thumbnail
            }).save();
        } else {
            return song.save();
        }
    }

    public async setCached(uid: string, cached: boolean): Promise<void> {
        this.logger.verbose(`Setting cache state of song ${uid} to ${cached}`);
        await MongoDB.Song.updateOne(
            {
                uid
            }, {
                $set: {"cached": cached}
            }
        );
    }

    public async isCached(uid: string): Promise<boolean> {
        this.logger.verbose(`Checking cache state of song ${uid}`);
        const songDoc = await MongoDB.Song.findOne({uid});
        return songDoc.cached || false;
    }
}
