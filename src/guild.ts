import {Logger, getLogger} from "./logger";
import {BilibiliSong} from "./bilibili-song";
import {Message, MessageEmbed, StreamDispatcher, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {CommandType, CommandEngine} from "./command";
import * as youtubedl from "youtube-dl";

export class GuildManager {
    logger: Logger;
    id: string;
    isPlaying: boolean;
    activeConnection: VoiceConnection;
    activeTextChannel: TextChannel;
    activeDispatcher: StreamDispatcher;
    queue: BilibiliSong[];
    commandPrefix: string;
    commandEngine: CommandEngine;

    constructor(id: string, prefix: string = '~') {
        this.logger = getLogger(`GuildManager-${id}`);
        this.id = id;
        this.isPlaying = false;
        this.queue = [];
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

        if (this.isPlaying) {
            // Append cases
        } else {
            // Start cases
            msg.member.voice.channel.join().then((connection) => {
                this.activeConnection = connection;
                this.isPlaying = true;
                this.printPlaying(song);
                this.activeDispatcher = connection.play(song.streamer.start());
                this.activeDispatcher.setVolume(0.1);
            })
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

    printPlaying(song: BilibiliSong) {
        let embed = new MessageEmbed()
            .setTitle('Now playing')
            .setDescription(`${song.title} [<@${song.initiator.id}>]`);
        this.activeTextChannel.send(embed);
    }
}