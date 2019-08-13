import {Logger, getLogger} from "../../logger";
import * as config from "../../../botconfig.json";
import {connect, Mongoose} from "mongoose";

class MongoDBService {
    private uri: string;

    logger: Logger;
    client: Mongoose;

    constructor() {
        this.logger = getLogger('MongoDB');
        if (!config || !config['mongoUri']) {
            this.logger.error(`Missing botconfig.json or "mongoUri" in json`);
        }
        this.uri = config['mongoUri'];
    }

    async start() {
        try {
            this.client = await connect(`${this.uri}/default`, {useNewUrlParser: true});
            this.logger.info('Connected to default');
            return true
        } catch (error) {
            this.logger.error(`MongoDB connection error: ${error}`);
            return false
        }
    }

    async getConnection(database: string) {
        const existConnection = this.client.connections.find((conn) => {
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
