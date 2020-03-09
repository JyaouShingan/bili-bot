import * as config from "../botconfig.json";
import {getLogger, Logger} from "./utils/logger";

class Configuration {
    private static instance: Configuration;
    public static getInstance(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }

    protected readonly logger: Logger;

    // Required
    private discordToken: string;
    private mongoUri: string;
    private googleCloudBucketName: string;

    // Optional
    private mongoDatabaseName?: string;
    private googleCloudAccountKeyFile?: string;
    private localCacheDirectory: string;

    private constructor() {
        this.logger = getLogger('Configuration');
    }

    public parse(): boolean {
        if (!config) {
            this.logger.error('Missing botconfig.json');
            return false;
        }
        if (!config['discordToken']) {
            this.logger.error('Missing "discordToken" in botconfig.json');
            return false;
        }
        if (!config['mongoUri']) {
            this.logger.error('Missing "mongoUri" in botconfig.json');
            return false;
        }
        if (!config['gcloudCacheBucket']) {
            this.logger.error('Missing "cacheBucket" in botconfig.json');
            return false;
        }

        this.discordToken = config['discordToken'];
        this.mongoUri = config['mongoUri'];
        this.googleCloudBucketName = config['gcloudCacheBucket'];

        // Optionals
        this.mongoDatabaseName = config['databaseName'] || null;
        this.googleCloudAccountKeyFile = config['gcloudKeyFile'] || null;
        this.localCacheDirectory = config['localCacheDirectory'] || 'cache';

        return true;
    }

    public getDiscordToken(): string {
        return this.discordToken;
    }

    public getMongoUri(): string {
        return this.mongoUri;
    }

    public getCacheBucketName(): string {
        return this.googleCloudBucketName;
    }

    public getMongoDatabaseName(): string | null {
        return this.mongoDatabaseName;
    }

    public getGoogleKeyFile(): string | null {
        return this.googleCloudAccountKeyFile;
    }

    public getLocalCacheDirectory(): string {
        return this.localCacheDirectory;
    }
}

const configuration = Configuration.getInstance();
export default configuration;
