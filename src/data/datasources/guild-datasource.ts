import MongoDB from "../db/service";
import {getLogger, Logger} from "../../utils/logger";
import {GuildDoc} from "../db/schemas/guild";
import {GuildManager} from "../../app/guild";

export class GuildDataSource {
    private static instance: GuildDataSource;
    public static getInstance(): GuildDataSource {
        if (!GuildDataSource.instance) {
            if (!MongoDB.isConnected()) {
                throw new Error('Mongo DB is not connected');
            }
            GuildDataSource.instance = new GuildDataSource();
        }
        return GuildDataSource.instance;
    }

    protected readonly logger: Logger;

    private constructor() {
        this.logger = getLogger('GuildDataSource');
    }

    public async load(): Promise<GuildDoc[]> {
        this.logger.verbose(`Querying all guilds`);
        return MongoDB.Guild.find({});
    }

    public async insert(guildManager: GuildManager): Promise<void> {
        this.logger.verbose(`Inserting guild ${guildManager.id}`);
        await new MongoDB.Guild({
            uid: guildManager.id,
            serverName: guildManager.guild.name,
            joinedAt: guildManager.guild.joinedAt,
            commandPrefix: guildManager.commandPrefix
        }).save();
    }

    public async updatePrefix(guildManager: GuildManager): Promise<void> {
        this.logger.verbose(`Updating command prefix for guild ${guildManager.id}`);
        await MongoDB.Guild.updateOne(
            {
                uid: guildManager
            }, {
                commandPrefix: guildManager.commandPrefix
            }
        );
    }
}
