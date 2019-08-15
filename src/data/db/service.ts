import {Logger, getLogger} from "../../utils/logger";
import * as config from "../../../botconfig.json";
import {connect, Connection, Mongoose} from "mongoose";

class MongoDBService {
    private readonly uri: string;

    protected readonly logger: Logger;
    private client: Mongoose;

    public constructor() {
        this.logger = getLogger('MongoDB');
        if (!config || !config['mongoUri']) {
            this.logger.error(`Missing botconfig.json or "mongoUri" in json`);
        }
        this.uri = config['mongoUri'];
    }

    public async start(): Promise<boolean> {
        try {
            this.client = await connect(`${this.uri}/default`, {useNewUrlParser: true});
            this.logger.info('Connected to default');
            return true
        } catch (error) {
            this.logger.error(`MongoDB connection error: ${error}`);
            return false
        }
    }

    public async getConnection(database: string): Promise<Connection> {
        const existConnection = this.client.connections.find((conn): boolean => {
            return conn.db.databaseName == database;
        });
        if (existConnection) return existConnection;
        const connection = await this.client.createConnection(`${this.uri}/${database}`, {useNewUrlParser: true});
        this.logger.info(`Connected to guild database ${database}`);
        return connection;
    }
}

const MongoDB = new MongoDBService();
export default MongoDB;
