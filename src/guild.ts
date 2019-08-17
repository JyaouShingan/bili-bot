import {Logger, getLogger} from "./utils/logger";
import {BilibiliSong} from "./data/model/bilibili-song";
import {Guild, GuildMember, Message, MessageEmbed, StreamDispatcher, TextChannel, VoiceConnection} from "discord.js";
import {SearchSongEntity} from "./data/datasources/bilibili-api";
import {CommandEngine} from "./commands/command-engine";
import {CommandException} from "./commands/base-command";
import {GuildDataManager} from "./data/managers/guild-data-manager";
import {QueueManager} from "./data/managers/queue-manager";

export class GuildManager {
    protected readonly logger: Logger;
    public readonly id: string;
    public readonly guild: Guild;
    public readonly queueManager: QueueManager;
    public activeTextChannel: TextChannel;
    public currentSearchResult?: SearchSongEntity[];
    public currentShowlistResult: BilibiliSong[];
    public commandPrefix: string;
    protected readonly commandEngine: CommandEngine;
    public readonly dataManager: GuildDataManager;
    public previousCommand: null | "search" | "showlist";

    public constructor(guild: Guild, prefix: string = '~') {
        this.logger = getLogger(`GuildManager-${guild.id}`);
        this.id = guild.id;
        this.guild = guild;
        this.queueManager = new QueueManager(this);
        this.currentShowlistResult = [];
        this.previousCommand = null;
        this.commandPrefix = prefix;
        this.commandEngine = new CommandEngine(this);
        this.dataManager = new GuildDataManager(this);
    }

    public async processMessage(msg: Message): Promise<void> {
        if (msg.content.startsWith(this.commandPrefix)) {
            this.logger.info(`Processing command: ${msg.content}`);
            const command = msg.content.slice(this.commandPrefix.length);
            const args = command.split(/\s+/);
            if (args.length < 1) return;
            this.activeTextChannel = msg.channel as TextChannel;
            await this.commandEngine.process(msg, args);
        }
    }

    // HELPER FUNCTIONS

    public async joinChannel(message: Message): Promise<void> {
        this.queueManager.activeConnection = await message.member.voice.channel.join();
    }

    public async playSong(msg: Message, song: BilibiliSong): Promise<void> {
        // Check connection
        if (!this.queueManager.activeConnection) {
            await this.joinChannel(msg);
        }
        this.queueManager.pushSong(song);
    }

    public playNext(): void {
        this.queueManager.next();
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

    public printOutOfSongs(): void {
        this.activeTextChannel.send(new MessageEmbed().setDescription("Running out of songs"));
    }

    public printAddToQueue(song: BilibiliSong, queueLength: number): void {
        const embed = new MessageEmbed()
            .setDescription(`${song.title} is added to playlist, current number of songs in the list: ${queueLength}`);
        this.activeTextChannel.send(embed);
    }

    public checkMemberInChannel(member: GuildMember): void {
        if (!member.voice || !member.voice.channel) {
            throw CommandException.UserPresentable('You are not in a voice channel');
        } else if (this.queueManager.activeConnection && member.voice.channel.id != this.queueManager.activeConnection.channel.id) {
            throw (CommandException.UserPresentable("You cannot use this command if you are not in the channel I'm playing"));
        } else {
            return;
        }
    }
}
