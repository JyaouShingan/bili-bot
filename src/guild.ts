import {Logger, getLogger} from "./logger";
import {BilibiliSong} from "./bilibili-song";
import {Message, MessageEmbed, StreamDispatcher, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {CommandType, CommandEngine} from "./command";
import * as youtubedl from "youtube-dl";
import { Streamer } from "./streamer";

export class GuildManager {
    logger: Logger;
    id: string;
    isPlaying: boolean;
    activeConnection: VoiceConnection;
    activeTextChannel: TextChannel;
    activeDispatcher: StreamDispatcher;
    playlist: Array<BilibiliSong>;
    commandPrefix: string;
    commandEngine: CommandEngine;

    constructor(id: string, prefix: string = '~') {
        this.logger = getLogger(`GuildManager-${id}`);
        this.id = id;
        this.isPlaying = false;
        this.playlist = [];
        this.commandPrefix = prefix;
        this.commandEngine = new CommandEngine();
        this.setupCommandEnginee();
    }

    setupCommandEnginee(): void {
        this.commandEngine.on(CommandType.info, (msg: Message, song: BilibiliSong) => {
            this.handleInfo(msg, song);
        });
        this.commandEngine.on(CommandType.play, (msg: Message, song: BilibiliSong) => {
            this.handlePlay(msg, song);
        });
        this.commandEngine.on(CommandType.pause, (msg: Message) => {
            this.handlePause(msg);
        });
        this.commandEngine.on(CommandType.resume, (msg: Message) => {
            this.handleResume(msg);
        });
        this.commandEngine.on(CommandType.next, (msg: Message) => {
            this.handleNext(msg);
        });
        this.commandEngine.on(CommandType.stop, (msg: Message) => {
            this.handleStop(msg);
        });
        this.commandEngine.on(CommandType.clear, (msg: Message) => {
            this.handleClear(msg);
        });
        this.commandEngine.on(CommandType.shuffle, (msg: Message) => {
            this.handleShuffle(msg);
        });
        this.commandEngine.on(CommandType.leave, (msg: Message) => {
            this.handleLeave(msg);
        });

    }

    processMessage(msg: Message): void {
        this.logger.info(`Processing message: ${msg.content}`);
        if (msg.content.startsWith(this.commandPrefix)) {
            let command = msg.content.slice(this.commandPrefix.length);
            let args = command.split(/\s+/);
            if (args.length < 1) return;
            this.activeTextChannel = msg.channel as TextChannel;
            this.commandEngine.process(msg, args);
        }
    }

    handleInfo(msg: Message, song: BilibiliSong) {
        this.logger.info(`Info command - ${song.title}`);
        let embed = new MessageEmbed()
            .setTitle(song.title)
            .setDescription(song.description)
            .setFooter(song.hmsDuration)
            .setThumbnail(song.thumbnail)
            .setColor(0x00FF00);
        msg.channel.send(embed);
    }

    handlePlay(msg: Message, song: BilibiliSong) {
        this.logger.info(`Play command - ${song.title}`);

        // Reject cases
        if (!msg.member.voice.channel) {
            msg.reply('You are not in a voice channel');
            return;
        }
        if (this.isPlaying && this.activeConnection.channel.id != msg.member.voice.channel.id) {
            msg.reply(`I'm currently playing in another channel`);
            return;
        }

        // Add to play list
        song.streamer.start();
        this.playlist.push(song);

        if (this.isPlaying) {
            this.logger.info(`Song ${song.title} added to the queue`);
        } else if (!this.activeConnection) {
            msg.member.voice.channel.join().then((connection) => {
                this.activeConnection = connection;
                this.playNext();
            })
        } else {
            this.playNext();
        }
    }

    handlePause(msg: Message) {
        if (!this.isPlaying) return;
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot pause if you are not in the voice channel I'm playing`);
            return;
        }
        if (this.activeDispatcher) {
            this.activeDispatcher.pause();
        }
    }

    handleResume(msg: Message) {
        if (!this.isPlaying) return;
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot resume if you are not in the voice channel I'm playing`);
            return;
        }
        if (this.activeDispatcher) {
            this.activeDispatcher.resume();
        }
    }

    handleNext(msg: Message) {
        if (this.playlist.length === 0) return;
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot skip if you are not in the voice channel I'm playing`);
            return;
        }
        if (this.activeDispatcher) {
            this.activeDispatcher.destroy();
        }
        this.playNext();
    }

    handleStop(msg: Message) {
        if (!this.isPlaying) return;
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot stop me if you are not in the voice channel I'm playing`);
            return;
        }
        this.isPlaying = false;
        if (this.activeDispatcher) {
            this.activeDispatcher.destroy();
        }
    }

    handleClear(msg: Message) {
        if (!this.isPlaying) return;
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot clear me if you are not in the voice channel I'm playing`);
            return;
        }
        this.clearPlaylist();
        this.activeTextChannel.send("Playlist cleared");
    }

    handleShuffle(msg: Message) {
        if (!this.isPlaying) return;
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot shuffle me if you are not in the voice channel I'm playing`);
            return;
        }
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
        this.activeTextChannel.send("Playlist shuffled");
    }

    handleLeave(msg: Message) {
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot let me leave if you are not in the voice channel I'm playing`);
            return;
        }
        this.activeConnection.disconnect();
        this.activeConnection = null;
        this.activeDispatcher = null;
        this.isPlaying = false;
        this.clearPlaylist();
    }

    clearPlaylist() {
        while(this.playlist.length > 0) this.playlist.pop();
    }

    playNext() {
        this.isPlaying = true;
        const currentSong = this.playlist.shift();
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
}