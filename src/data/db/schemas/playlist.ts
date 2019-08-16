import {Document, Schema} from "mongoose";

const playlistSchema = new Schema({
    name: {type: String, required: true, unique: true},
    creator: {type: String, required: true},
    songs: {
        type: [
            {type: Schema.Types.ObjectId, ref: 'Song'}
        ],
        required: true
    },
    guildId: {type: String, required: true, ref: 'Guild'}
});


export interface PlaylistDoc extends Document {
    name: string;
    creator: string;
    songs: Schema.Types.ObjectId[];
    guildId: string;
}
export const PlaylistSchema = playlistSchema;
