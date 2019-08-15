import {Document, Schema} from "mongoose";
import {BilibiliSong} from "../../model/bilibili-song";
import {User} from "discord.js";

const songSchema = new Schema({
    uid: {type: String, required: true, unique: true},
    url: {type: String, required: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    hmsDuration: {type: String, required: true},
    rawDuration: {type: Number, required: true},
    description: String,
    thumbnail: String
});

songSchema.method('toSong', function (initiator: User): BilibiliSong {
    return BilibiliSong.withRecord(this, initiator)
});

export interface SongDoc extends Document {
    uid: string;
    url: string;
    title: string;
    author: string;
    hmsDuration: string;
    rawDuration: number;
    description: string|null;
    thumbnail: string|null;
    toSong(initiator: User): BilibiliSong;
}
export const SongSchema = songSchema;
