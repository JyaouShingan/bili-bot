import {Client, Message} from 'discord.js';
import {Logger, getLogger} from "./logger";
import {Streamer} from "./streamer";
import * as ytdl from 'youtube-dl';
import {BilibiliSong} from "./bilibili-song";

export class DiscordBot {
    logger: Logger;
    client: Client;

    /** @param {string} token */
    constructor(public token: string) {
        this.logger = getLogger('DiscordBot');
        this.client = new Client();
        this.token = token;
    }

    run() {
        this.client.login(this.token);
        this.client.on('ready', () => { this.clientReady() });
        this.client.on('message', (msg) => { this.handleMessage(msg) });
    }

    clientReady() {
        this.logger.info(`BiliBot logged in as ${this.client.user.username}`);
    }

    handleMessage(msg: Message) {
        this.logger.info(`Message: ${msg}`);
        if (msg.author.username === "JyaouShingan") {
            this.generateSong(msg.content, (song) => {
                if (!song) return;
                let streamer = new Streamer(song);
                streamer.start();
                if (msg.member.voice.channel) {
                    msg.member.voice.channel.join().then((connection) => {
                        const dispatcher = connection.play(streamer.getOutputStream());
                        dispatcher.setVolume(0.1);
                        dispatcher.on('finish', () => {
                            dispatcher.destroy();
                        });
                    });
                }
            });
        }
    }

    generateSong(url: string, callback: (song: BilibiliSong) => void) {
        ytdl.getInfo(url, (err, info) => {
            if (err) {
                this.logger.error(`Query Info error: ${err}`);
            } else {
                let song = new BilibiliSong(
                    url,
                    info['title'],
                    info['uploader'],
                    info['thumbnail'],
                    info._duration_raw
                );
                callback(song);
            }
        });
    }
}