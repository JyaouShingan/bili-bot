import {Document, Schema} from "mongoose";
import {BilibiliSong} from "../bilibili-song";
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

songSchema.method('toSong', function (initiator: User) {
    return BilibiliSong.withRecord(this, initiator)
});

const playlistSchema = new Schema({
    name: {type: String, required: true, unique: true},
    creator: {type: String, required: true},
    songs: {
        type: [
            {type: Schema.Types.ObjectId, ref: 'Song'}
        ],
        required: true
    }
});

export interface ISong extends Document {
    uid: string
    url: string
    title: string
    author: string
    hmsDuration: string
    rawDuration: number
    description: string|null
    thumbnail: string|null
    toSong(initiator: User): BilibiliSong
}

export interface IPlaylist extends Document {
    name: string
    creator: string
    songs: Schema.Types.ObjectId[]
}

export const SongSchema = songSchema;
export const PlaylistSchema = playlistSchema;
