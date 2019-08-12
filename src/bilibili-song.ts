import {Info} from "youtube-dl";
import {User} from "discord.js";
import {Streamer} from "./streamer";
import {uidExtractor} from "./utils/utils";

export class BilibiliSong {
    url: string;
    title: string;
    author: string;
    description: string;
    thumbnail: string;
    rawDuration: number;
    hmsDuration: string;
    initiator: User;
    streamer: Streamer;
    uid: string;

    private constructor() {}

    static withInfo(info: Info, initiator: User) {
        const song = new BilibiliSong();
        song.url = info['webpage_url'];
        song.title = info['title'];
        song.author = info['uploader'];
        song.description = info['description'];
        song.thumbnail = info['thumbnail'];
        song.rawDuration = info._duration_raw;
        song.hmsDuration = info._duration_hms;
        song.initiator = initiator;
        song.streamer = new Streamer(song);
        song.uid = uidExtractor(song.url);
        return song
    }

    static withRecord(record: object, initiator: User) {
        const song = new BilibiliSong();
        song.url = record['url'];
        song.title = record['title'];
        song.author = record['author'];
        song.description = record['description'];
        song.thumbnail = record['thumbnail'];
        song.rawDuration = record['rawDuration'];
        song.hmsDuration = record['hmsDuration'];
        song.initiator = initiator;
        song.streamer = new Streamer(song);
        song.uid = uidExtractor(song.url);
        return song;
    }

    getUrl() {
        return this.url;
    }
}
