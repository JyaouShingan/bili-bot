import {Client, Message} from 'discord.js';
import {Logger, getLogger} from "./utils/logger";
import {GuildManager} from "./guild";
import {GuildDataSource} from "./data/datasources/guild-datasource";


export class DiscordBot {
    private readonly token: string;
    private logger: Logger;
    private client: Client;
    private guilds: Map<string, GuildManager>;

    public constructor(token: string) {
        this.logger = getLogger('DiscordBot');
        this.token = token;
        this.client = new Client();
        this.guilds = new Map<string, GuildManager>();
    }

    public run(): void {
        this.client.login(this.token);
        this.client.on('ready', async (): Promise<void> => {
            await this.clientReady();
            this.client.on('message', async (msg): Promise<void> => {
                await this.handleMessage(msg)
            });
        });
    }

    private async clientReady(): Promise<void> {
        this.logger.info(`BiliBot logged in as ${this.client.user.username}`);
        const guildDocs = await GuildDataSource.getInstance().load();
        for(const guildDoc of guildDocs) {
            const guild = this.client.guilds.get(guildDoc.uid);
            if (guild) {
                this.guilds.set(guild.id, new GuildManager(guild, guildDoc.commandPrefix));
            }
        }
    }

    private async handleMessage(msg: Message): Promise<void> {
        if (!msg.guild) return;
        const guildId = msg.guild.id;
        if (!this.guilds.has(guildId)) {
            const newManager = new GuildManager(msg.guild);
            this.guilds.set(guildId, newManager);
            await GuildDataSource.getInstance().insert(newManager);
        }
        await this.guilds.get(guildId).processMessage(msg);
    }
}
