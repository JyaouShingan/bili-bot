import {GuildManager} from "../../guild";
import {BilibiliSong} from "../model/bilibili-song";
import {getLogger, Logger} from "../../utils/logger";
import {StreamDispatcher, VoiceConnection} from "discord.js";
import {CommandException} from "../../commands/base-command";
import {shuffle} from "../../utils/utils";
import {StreamerState} from "../streamer";

export class QueueManager {
    protected readonly logger: Logger;
    private readonly guild: GuildManager;
    private readonly threshold: number;
    public isPlaying: boolean;
    public readonly playlist: BilibiliSong[];
    private readonly waitingList: BilibiliSong[];
    private readonly loadingList: Set<BilibiliSong>;
    public currentSong?: BilibiliSong;
    public activeConnection: VoiceConnection;
    public activeDispatcher: StreamDispatcher;

    public constructor(guild: GuildManager, threshold: number = 3) {
        this.logger = getLogger(`QueueManager-${guild.id}`);
        this.guild = guild;
        this.playlist = [];
        this.waitingList = [];
        this.loadingList = new Set<BilibiliSong>();
        this.isPlaying = false;
        this.threshold = threshold;
    }

    public listIsEmpty(): boolean {
        return this.playlist.length === 0;
    }

    public pushSong(song: BilibiliSong): void {
        this.playlist.push(song);
        this.logger.info(`Song ${song.title} added to the queue`);
        if (song.streamer.state === StreamerState.UNLOADED) {
            if (this.loadingList.size < this.threshold) {
                this.startLoading(song);
            } else {
                this.waitingList.push(song);
            }
        }
        if (!this.isPlaying) {
            this.playNext();
        } else {
            this.guild.printAddToQueue(song, this.playlist.length);
        }
    }

    public pushSongs(songs: BilibiliSong[]): void {
        this.logger.info(`${songs.length} songs added to the queue`);
        for (const song of songs) {
            this.playlist.push(song);
            if (song.streamer.state === StreamerState.UNLOADED) {
                if (this.loadingList.size < this.threshold) {
                    this.startLoading(song);
                } else {
                    this.waitingList.push(song);
                }
            }
        }
        if (!this.isPlaying) {
            this.playNext();
        }
    }

    public clear(): void {
        while (this.playlist.length !== 0) this.playlist.pop();
        while (this.waitingList.length !== 0) this.waitingList.pop();
        this.loadingList.forEach((song: BilibiliSong): void => {
            song.streamer.stop();
        });
        this.loadingList.clear();
    }

    public promoteSong(index: number): BilibiliSong {
        if (index < 0 || index >= this.playlist.length) {
            throw CommandException.UserPresentable(`The index you entered is out of bounds, please enter a number between ${1} and ${this.playlist.length}`);
        }

        const song = this.playlist.splice(index)[0];
        this.playlist.unshift(song);

        if (song.streamer.state === StreamerState.UNLOADED) {
            this.startLoading(song);
        }

        return song;
    }

    public doShuffle(): void {
        shuffle(this.playlist);
        while (this.waitingList.length !== 0) this.waitingList.pop();
        for (const song of this.playlist) {
            if (song.streamer.state === StreamerState.UNLOADED) {
                this.waitingList.push(song);
            }
        }
    }

    public pause(): boolean {
        if (this.activeDispatcher) {
            this.activeDispatcher.pause();
            return true;
        }
        return false;
    }

    public resume(): boolean {
        if (this.activeDispatcher) {
            this.activeDispatcher.resume();
            return true;
        }
        return false;
    }

    public stop(): void {
        this.isPlaying = false;
        if (this.activeDispatcher) {
            this.activeDispatcher.destroy();
            this.activeDispatcher = null;
        }
        this.clear();
    }

    public next(): void {
        const current = this.currentSong;
        if (this.loadingList.has(current)) {
            current.streamer.stop();
            this.loadingList.delete(current);
            if (this.loadingList.size < this.threshold && this.waitingList.length !== 0) {
                const song = this.waitingList.shift();
                this.startLoading(song);
            }
        }
        current.streamer.destroy();
        this.playNext();
    }

    private startLoading(song: BilibiliSong): void {
        this.logger.info(`Start loading ${song.title}`);
        song.streamer.start();
        song.streamer.on('finish', (): void => {
            this.finishLoading(song);
        });
        this.loadingList.add(song);
    }

    private finishLoading(song: BilibiliSong): void {
        this.logger.info(`Finished loading ${song.title}`);
        this.loadingList.delete(song);
        if (this.loadingList.size < this.threshold && this.waitingList.length !== 0) {
            const nextSong = this.waitingList.shift();
            this.startLoading(nextSong);
        }
    }

    private playSong(song: BilibiliSong): void {
        this.isPlaying = true;
        this.currentSong = song;
        this.guild.printPlaying(song);
        this.activeDispatcher = this.activeConnection.play(song.streamer.getOutputStream());
        this.activeDispatcher.setVolume(0.2);
        this.activeDispatcher.on('finish', (): void => {
            song.streamer.destroy();
            this.playNext();
        });
    }

    private playNext(): void {
        if (this.activeDispatcher) {
            this.activeDispatcher.destroy();
            this.activeDispatcher = null;
        }
        if (this.playlist.length === 0) {
            this.isPlaying = false;
            this.guild.printOutOfSongs();
        } else {
            this.playSong(this.playlist.shift());
        }
    }
}
