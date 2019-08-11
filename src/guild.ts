import {Logger, getLogger} from "./logger";
import {BilibiliSong} from "./bilibili-song";
import {Message, MessageEmbed, StreamDispatcher, TextChannel, VoiceConnection} from "discord.js";
import * as youtubedl from "youtube-dl";
import * as Promise from "bluebird";
import * as fs from 'fs';
import {SearchSongEntity} from "./bilibili-api";
import {CommandEngine} from "./command-engine";
import {CommandException} from "./commands/base-command";

let getInfo = Promise.promisify(youtubedl.getInfo);

export class GuildManager {
    logger: Logger;
    id: string;
    isPlaying: boolean;
    activeConnection: VoiceConnection;
    activeTextChannel: TextChannel;
    activeDispatcher: StreamDispatcher;
    playlist: Array<BilibiliSong>;
    currentSong?: BilibiliSong;
    currentSearchResult?: Array<SearchSongEntity>;
    currentShowlistResult: Array<BilibiliSong>;
    commandPrefix: string;
    commandEngine: CommandEngine;
    previousCommand: null | "search" | "showlist";

    constructor(id: string, prefix: string = '~') {
        this.logger = getLogger(`GuildManager-${id}`);
        this.id = id;
        this.isPlaying = false;
        this.playlist = [];
        this.currentShowlistResult = [];
        this.previousCommand = null;
        this.currentSong = null;
        this.commandPrefix = prefix;
        this.commandEngine = new CommandEngine(this);
    }

    processMessage(msg: Message): void {
        if (msg.content.startsWith(this.commandPrefix)) {
            this.logger.info(`Processing command: ${msg.content}`);
            let command = msg.content.slice(this.commandPrefix.length);
            let args = command.split(/\s+/);
            if (args.length < 1) return;
            this.activeTextChannel = msg.channel as TextChannel;
            this.commandEngine.process(msg, args);
        }
    }

    // HELPER FUNCTIONS

    clearPlaylist() {
        while(this.playlist.length > 0) this.playlist.pop();
    }

    playSong(msg: Message, song: BilibiliSong) {
        // Add to play list
        song.streamer.start();
        this.playlist.push(song);

        if (this.isPlaying) {
            this.logger.info(`Song ${song.title} added to the queue`);
            let embed = new MessageEmbed()
                .setDescription(`${song.title} is added to playlist, current number of songs in the list: ${this.playlist.length}`);
            this.activeTextChannel.send(embed);
        } else if (!this.activeConnection) {
            msg.member.voice.channel.join().then((connection) => {
                this.activeConnection = connection;
                this.playNext();
            })
        } else {
            this.playNext();
        }
    }

    playNext() {
        this.isPlaying = true;
        const currentSong = this.playlist.shift();
        this.currentSong = currentSong;
        this.logger.info(`Start playing song ${currentSong.title}`);
        this.printPlaying(currentSong);
        const dispatcher = this.activeConnection.play(currentSong.streamer.getOutputStream());
        this.activeDispatcher = dispatcher;
        dispatcher.setVolume(0.1);
        dispatcher.on('finish', () => {
            dispatcher.destroy();
            if (this.playlist.length === 0) {
                this.isPlaying = false;
                this.activeDispatcher = null;
                this.activeTextChannel.send("Running out of songs");
            } else {
                this.logger.info("Playing next song");
                this.playNext();
            }
        });
    }

    printPlaying(song: BilibiliSong) {
        let embed = new MessageEmbed()
            .setTitle('Now playing')
            .setDescription(`${song.title} [<@${song.initiator.id}>]`);
        this.activeTextChannel.send(embed);
    }

    checkUserInChannel(message: Message): Promise<void> {
        if (!message.member.voice || !message.member.voice.channel) {
            return Promise.reject(CommandException.UserPresentable('You are not in a voice channel'));
        } else if (this.activeConnection && message.member.voice.channel.id != this.activeConnection.channel.id) {
            return Promise.reject(CommandException.UserPresentable("You cannot use this command if you are not in the channel I'm playing"));
        } else {
            return Promise.resolve();
        }
    }
}