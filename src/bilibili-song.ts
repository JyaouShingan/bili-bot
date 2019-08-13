import {Info} from "youtube-dl";
import {User} from "discord.js";
import {Streamer} from "./streamer";
import {uidExtractor} from "./utils/utils";

export class BilibiliSong {
    readonly url: string;
    readonly title: string;
    readonly author: string;
    readonly description: string;
    readonly thumbnail: string;
    readonly rawDuration: number;
    readonly hmsDuration: string;
    readonly initiator: User;
    readonly streamer: Streamer;
    readonly uid: string;

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

    static withInfo(info: Info, initiator: User) {
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

    static withRecord(record: object, initiator: User) {
        return new BilibiliSong(
            record['url'],
            record['title'],
            record['author'],
            record['description'],
            record['thumbnail'],
            record['rawDuration'],
            record['hmsDuration'],
            initiator,
            record['_id']
        );
    }

    getUrl() {
        return this.url;
    }
}
