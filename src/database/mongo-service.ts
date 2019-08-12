import {Logger, getLogger} from "../logger";
import {connect, Mongoose} from "mongoose";

class MongoDBService {
    private uri: string = 'mongodb://localhost:27017';

    logger: Logger;
    client: Mongoose;

    constructor() {
        this.logger = getLogger('MongoDB');
    }

    async start() {
        try {
            this.client = await connect(`${this.uri}/default`, {useNewUrlParser: true});
            this.logger.info('Connected to database');
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
        this.logger.info('Connected to database');
        return connection;
    }
}

export const MongoDB = new MongoDBService();
