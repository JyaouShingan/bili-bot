import {Logger, getLogger} from "./logger";
import {BilibiliSong} from "./bilibili-song";
import {GuildMember, Message, MessageEmbed, StreamDispatcher, TextChannel, VoiceConnection} from "discord.js";
import {SearchSongEntity} from "./bilibili-api";
import {CommandEngine} from "./command-engine";
import {CommandException} from "./commands/base-command";
import {GuildDataSource} from "./data/guild-datasource";

export class GuildManager {
    protected readonly logger: Logger;
    public readonly id: string;
    public isPlaying: boolean;
    public activeConnection: VoiceConnection;
    public activeTextChannel: TextChannel;
    public activeDispatcher: StreamDispatcher;
    public playlist: BilibiliSong[];
    public currentSong?: BilibiliSong;
    public currentSearchResult?: SearchSongEntity[];
    public currentShowlistResult: BilibiliSong[];
    public commandPrefix: string;
    protected readonly commandEngine: CommandEngine;
    public readonly datasource: GuildDataSource;
    public previousCommand: null | "search" | "showlist";

    public constructor(id: string, prefix: string = '~') {
        this.logger = getLogger(`GuildManager-${id}`);
        this.id = id;
        this.isPlaying = false;
        this.playlist = [];
        this.currentShowlistResult = [];
        this.previousCommand = null;
        this.currentSong = null;
        this.commandPrefix = prefix;
        this.commandEngine = new CommandEngine(this);
        this.datasource = new GuildDataSource(this);
    }

    public processMessage(msg: Message): void {
        if (msg.content.startsWith(this.commandPrefix)) {
            this.logger.info(`Processing command: ${msg.content}`);
            const command = msg.content.slice(this.commandPrefix.length);
            const args = command.split(/\s+/);
            if (args.length < 1) return;
            this.activeTextChannel = msg.channel as TextChannel;
            this.commandEngine.process(msg, args);
        }
    }

    // HELPER FUNCTIONS

    public async joinChannel(message: Message): Promise<void> {
        this.activeConnection = await message.member.voice.channel.join()
    }

    public clearPlaylist(): void {
        while(this.playlist.length > 0) this.playlist.pop();
    }

    public async playSong(msg: Message, song: BilibiliSong): Promise<void> {
        // Add to play list
        song.streamer.start();
        this.playlist.push(song);

        if (this.isPlaying) {
            this.logger.info(`Song ${song.title} added to the queue`);
            const embed = new MessageEmbed()
                .setDescription(`${song.title} is added to playlist, current number of songs in the list: ${this.playlist.length}`);
            this.activeTextChannel.send(embed);
        } else if (!this.activeConnection) {
            await this.joinChannel(msg);
            this.playNext();
        } else {
            this.playNext();
        }
    }

    public playNext(): void {
        this.isPlaying = true;
        const currentSong = this.playlist.shift();
        if (!currentSong.streamer.isLoading) currentSong.streamer.start();
        this.currentSong = currentSong;
        this.logger.info(`Start playing song ${currentSong.title}`);
        this.printPlaying(currentSong);
        const dispatcher = this.activeConnection.play(currentSong.streamer.getOutputStream());
        this.activeDispatcher = dispatcher;
        dispatcher.setVolume(0.1);
        dispatcher.on('finish', (): void => {
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

    public setPreviousCommand(command: null | "search" | "showlist"): void {
        this.previousCommand = command;
    }

    public setCurrentSearchResult(result: null | SearchSongEntity[]): void {
        this.currentSearchResult = result;
    }

    public setCurrentShowlistResult(result: null | BilibiliSong[]): void {
        this.currentShowlistResult = result;
    }

    public printPlaying(song: BilibiliSong): void {
        const embed = new MessageEmbed()
            .setTitle('Now playing')
            .setDescription(`${song.title} [<@${song.initiator.id}>]`);
        this.activeTextChannel.send(embed);
    }

    public checkMemberInChannel(member: GuildMember): void {
        if (!member.voice || !member.voice.channel) {
            throw CommandException.UserPresentable('You are not in a voice channel');
        } else if (this.activeConnection && member.voice.channel.id != this.activeConnection.channel.id) {
            throw (CommandException.UserPresentable("You cannot use this command if you are not in the channel I'm playing"));
        } else {
            return;
        }
    }
}
