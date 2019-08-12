import {Logger, getLogger} from "../logger";
import {MongoClient} from "mongodb";

class MongoDBService {
    private uri: string = 'mongodb://localhost:27017';

    logger: Logger;
    client: MongoClient;

    constructor() {
        this.logger = getLogger('MongoDB');
    }

    async start(): Promise<boolean> {
        try {
            this.client = await MongoClient.connect(this.uri, {useNewUrlParser: true});
            this.logger.info('Connected to database');
        } catch (error) {
            this.logger.error(`MongoDB connection error: ${error}`);
            return Promise.resolve(false);
        }
        return this.client.isConnected();
    }
}

export const MongoDB = new MongoDBService();
