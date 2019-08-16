import {Logger, getLogger} from "../../utils/logger";
import * as config from "../../../botconfig.json";
import {connect, Model, Mongoose} from "mongoose";
import {SongDoc, SongSchema} from "./schemas/song";
import {GuildDoc, GuildSchema} from "./schemas/guild";
import {PlaylistDoc, PlaylistSchema} from "./schemas/playlist";

class MongoDBService {
    private readonly uri: string;
    private readonly dbName: string;

    protected readonly logger: Logger;
    private client: Mongoose;

    // Models
    public Guild: Model<GuildDoc>;
    public Song: Model<SongDoc>;
    public Playlist: Model<PlaylistDoc>;

    public constructor() {
        this.logger = getLogger('MongoDB');
        if (!config || !config['mongoUri']) {
            this.logger.error(`Missing botconfig.json or "mongoUri" in json`);
        }
        this.uri = config['mongoUri'];
        this.dbName = config['databaseName'] || 'bili-bot'
    }

    public async start(): Promise<boolean> {
        try {
            this.client = await connect(`${this.uri}/${this.dbName}`, {useNewUrlParser: true});
            this.logger.info('Connected to default');

            this.Guild = this.client.model('Guild', GuildSchema);
            this.Song = this.client.model('Song', SongSchema);
            this.Playlist = this.client.model('Playlist', PlaylistSchema);
            return true
        } catch (error) {
            this.logger.error(`MongoDB connection error: ${error}`);
            return false
        }
    }

    public isConnected(): boolean {
        return this.client.connection.readyState === 1;
    }
}

const MongoDB = new MongoDBService();
export default MongoDB;
