import {Info} from "youtube-dl";
import {User} from "discord.js";
import {Streamer} from "./streamer";
import {uidExtractor} from "./utils/utils";

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

    private constructor(
        url: string,
        title: string,
        author: string,
        description: string,
        thumbnail: string,
        rawDuration: number,
        hmsDuration: string,
        initator: User,
        uid: string) {
        this.url = url;
        this.title = title;
        this.author = author;
        this.description = description;
        this.thumbnail = thumbnail;
        this.rawDuration = rawDuration;
        this.hmsDuration = hmsDuration;
        this.initiator = initator;
        this.uid = uid;
        this.streamer = new Streamer(this);
    }

    public static withInfo(info: Info, initiator: User): BilibiliSong {
        return new BilibiliSong(
            info['webpage_url'],
            info['title'],
            info['uploader'],
            info['description'],
            info['thumbnail'],
            info._duration_raw,
            info._duration_hms,
            initiator,
            uidExtractor(info['webpage_url'])
        )
    }

    public static withRecord(record: object, initiator: User): BilibiliSong {
        return new BilibiliSong(
            record['url'],
            record['title'],
            record['author'],
            record['description'],
            record['thumbnail'],
            record['rawDuration'],
            record['hmsDuration'],
            initiator,
            record['uid']
        );
    }

    public getUrl(): string {
        return this.url;
    }
}
