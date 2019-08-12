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

    constructor(info: Info, initiator: User) {
        this.url = info['webpage_url'];
        this.title = info['title'];
        this.author = info['uploader'];
        this.description = info['description'];
        this.thumbnail = info['thumbnail'];
        this.rawDuration = info._duration_raw;
        this.hmsDuration = info._duration_hms;
        this.initiator = initiator;
        this.streamer = new Streamer(this);
        this.uid = uidExtractor(this.url);
    }

    getUrl() {
        return this.url;
    }
}