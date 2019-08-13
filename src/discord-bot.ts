import {Client, Message} from 'discord.js';
import {Logger, getLogger} from "./logger";
import {GuildManager} from "./guild";



export class DiscordBot {
    private readonly token: string;
    private logger: Logger;
    private client: Client;
    private guilds: Map<string, GuildManager>;

    public constructor(token: string) {
        this.logger = getLogger('DiscordBot');
        this.token = token;
        this.client = new Client();
        this.token = token;
        this.guilds = new Map<string, GuildManager>();
    }

    public run(): void {
        this.client.login(this.token);
        this.client.on('ready', (): void => {
            this.clientReady()
        });
        this.client.on('message', (msg): void => {
            this.handleMessage(msg)
        });
    }

    private clientReady(): void {
        this.logger.info(`BiliBot logged in as ${this.client.user.username}`);
    }

    private handleMessage(msg: Message): void {
        if (!msg.guild) return;
        const guildId = msg.guild.id;
        if (!this.guilds.has(guildId)) {
            this.guilds.set(guildId, new GuildManager(guildId));
        }
        this.guilds.get(guildId).processMessage(msg);
    }
}
