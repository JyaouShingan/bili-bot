import {Info} from "youtube-dl";
import {User} from "discord.js";
import {Streamer} from "../streamer";
import {uidExtractor} from "../../utils/utils";
import {SongDataSource} from "../datasources/song-datasource";
import {SongDoc} from "../db/schemas/song";

export class BilibiliSong {
    public readonly url: string;
    public readonly title: string;
    public readonly author: string;
    public readonly description: string;
    public readonly thumbnail: string;
    public readonly rawDuration: number;
    public readonly hmsDuration: string;
    public readonly initiator: User;
    public readonly streamer: Streamer;
    public readonly uid: string;
    public readonly cached: boolean;

    private constructor(
        url: string,
        title: string,
        author: string,
        description: string,
        thumbnail: string,
        rawDuration: number,
        hmsDuration: string,
        initator: User,
        uid: string,
        cached: boolean) {
        this.url = url;
        this.title = title;
        this.author = author;
        this.description = description;
        this.thumbnail = thumbnail;
        this.rawDuration = rawDuration;
        this.hmsDuration = hmsDuration;
        this.initiator = initator;
        this.uid = uid;
        this.cached = cached;
        this.streamer = new Streamer(this);
    }

    public static async withInfo(info: Info, initiator: User): Promise<BilibiliSong> {
        const uid = uidExtractor(info['webpage_url']);
        const cached = await SongDataSource.getInstance().isCached(uid);
        return new BilibiliSong(
            info['webpage_url'],
            info['title'],
            info['uploader'],
            info['description'],
            info['thumbnail'],
            info._duration_raw,
            info._duration_hms,
            initiator,
            uid,
            cached
        );
    }

    public static withRecord(record: SongDoc, initiator: User): BilibiliSong {
        return new BilibiliSong(
            record.url,
            record.title,
            record.author,
            record.description,
            record.thumbnail,
            record.rawDuration,
            record.hmsDuration,
            initiator,
            record.uid,
            record.cached
        );
    }

    public getUrl(): string {
        return this.url;
    }
}
