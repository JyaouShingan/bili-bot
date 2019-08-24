import {getLogger, Logger} from "../../utils/logger";
import Config from "../../configuration";
import {Bucket, Storage} from "@google-cloud/storage";

export class GoogleCloudDataSource {
    private static instance: GoogleCloudDataSource;
    public static getInstance(): GoogleCloudDataSource {
        if (!GoogleCloudDataSource.instance) {
            GoogleCloudDataSource.instance = new GoogleCloudDataSource();
        }
        return GoogleCloudDataSource.instance;
    }

    protected readonly logger: Logger;
    private readonly bucket: Bucket;

    private constructor() {
        this.logger = getLogger('GoogleCloudDataSource');

        // Use explicitly provided key file when available
        const keyFilename = Config.getGoogleKeyFile();
        if (keyFilename) {
            this.bucket = new Storage({keyFilename}).bucket(Config.getCacheBucketName());
        } else {
            this.bucket = new Storage().bucket(Config.getCacheBucketName());
        }
    }

    public async setup(): Promise<boolean> {
        try {
            if (!await this.bucket.exists()) {
                this.logger.info('GCloud cache bucket does not exist, creating...');
                await this.bucket.create({regional: true});
                this.logger.info('GCloud cache bucket created');
            }
            return true;
        } catch (error) {
            this.logger.error(`GCloud cache setup error: ${error}`);
            return false;
        }
    }
}
