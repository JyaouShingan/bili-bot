import {Logger, getLogger} from "./logger";
import {BilibiliSong} from "./bilibili-song";
import {Emoji, Message, MessageEmbed, StreamDispatcher, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {CommandType, CommandEngine} from "./command";
import * as youtubedl from "youtube-dl";
import * as Promise from "bluebird";
import * as fs from 'fs';

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
    commandPrefix: string;
    commandEngine: CommandEngine;

    constructor(id: string, prefix: string = '~') {
        this.logger = getLogger(`GuildManager-${id}`);
        this.id = id;
        this.isPlaying = false;
        this.playlist = [];
        this.currentSong = null;
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
        this.commandEngine.on(CommandType.save, (msg: Message, playlist?: string) => {
            this.handleSave(msg, playlist);
        });
        this.commandEngine.on(CommandType.load, (msg: Message, playlist?: string) => {
            this.handleLoad(msg, playlist);
        });
        this.commandEngine.on(CommandType.list, (msg: Message) => {
            this.handleList(msg);
        });
        this.commandEngine.on(CommandType.promote, (msg: Message, index: number) => {
            this.handlePromote(msg, index);
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
        this.currentSong = null;
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
        if (!this.activeConnection) {
            return;
        }
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

    handleSave(msg: Message, playlist?: string) {
        if (!fs.existsSync('./playlist')) {
            fs.mkdirSync('./playlist');
        }

        const playlistName = playlist ? `./playlist/${playlist}` : './playlist/default';
        if (!fs.existsSync(playlistName)) {
            fs.writeFileSync(playlistName, '');
        }

        if (!this.currentSong) {
            this.logger.info('Playlist created');
            return;
        }

        const currentFile = fs.readFileSync(playlistName);
        if (currentFile.includes(this.currentSong.url)){
            this.activeTextChannel.send('Already exists');
            return;
        }

        fs.appendFile(playlistName, `${this.currentSong.url}\n`, (err) => {
            if (err) this.logger.info(err);
            else this.activeTextChannel.send('Added to playlist');
        });
    }

    handleLoad(msg: Message, playlist?: string) {
        if (!fs.existsSync('./playlist')) {
            fs.mkdirSync('./playlist');
            msg.reply('Nothing here yet');
            return;
        }

        const playlistName = playlist ? `./playlist/${playlist}` : './playlist/default';
        if (!fs.existsSync(playlistName)) {
            msg.reply('The playlist does not exist');
            return;
        }

        const playlistArray = fs.readFileSync(playlistName).toString().split("\n");
        msg.reply('Start loading playlist');
        for (let index in playlistArray) {
            if (playlistArray[index] === '') continue;
            getInfo(playlistArray[index]).then((info) => {
                let song = new BilibiliSong(info, msg.author);
                song.streamer.start();
                this.playlist.push(song);
                if (this.isPlaying) {
                    this.logger.info(`Song ${song.title} added to the queue`);
                } else if (!this.activeConnection) {
                    msg.member.voice.channel.join().then((connection) => {
                        this.activeConnection = connection;
                    })
                } else {

                }
            }).catch((err) => {
                if (err) this.logger.info(`Failed loading: ${err}`);
            });
        }
    }
    
    handleList(msg: Message) {
        if (this.playlist.length === 0) {
            const embed = new MessageEmbed()
                .setDescription(`Pending playlist is empty`);
            this.activeTextChannel.send(embed);
        } else {
            const playlistMessage = this.playlist.map((song, index) => {
                return `${index + 1}. ${song.title} [${song.initiator.toString()}]`;
            }).join('\n');
            const embed = new MessageEmbed()
                .setTitle('Playlist:')
                .setDescription(playlistMessage);
            this.activeTextChannel.send(embed);
        }
    }

    handlePromote(msg: Message, index: number) {
        if (!msg.member.voice.channel || msg.member.voice.channel.id != this.activeConnection.channel.id) {
            msg.reply(`You cannot promote songs if you are not in the voice channel I'm playing`);
            return;
        } else if (this.playlist.length === 0) {
            msg.reply(`Playlist is empty`);
            return;
        } else if (index < 0 || index >= this.playlist.length) {
            msg.reply(`The index you entered is out of bounds, please enter a number between ${1} and ${this.playlist.length}`);
            return;
        }

        const song = this.playlist.splice(index)[0];
        this.playlist.unshift(song);

        const embed = new MessageEmbed()
            .setDescription(`${song.title} has been promoted to top of the playlist`);
        this.activeTextChannel.send(embed);

        // Dragon:
        msg.react("🐲");
    }

    clearPlaylist() {
        while(this.playlist.length > 0) this.playlist.pop();
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
}