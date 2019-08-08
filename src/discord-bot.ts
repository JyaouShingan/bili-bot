import {Client, Message} from 'discord.js';
import {Logger, getLogger} from "./logger";
import {GuildManager} from "./guild";



export class DiscordBot {
    logger: Logger;
    client: Client;
    guilds: Map<string, GuildManager>;

    constructor(public token: string) {
        this.logger = getLogger('DiscordBot');
        this.client = new Client();
        this.token = token;
        this.guilds = new Map<string, GuildManager>();
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
        if (!msg.guild) return;
        let guildId = msg.guild.id;
        if (!this.guilds.has(guildId)) {
            this.guilds.set(guildId, new GuildManager(guildId));
        }
        this.guilds.get(guildId).processMessage(msg);
    }
}