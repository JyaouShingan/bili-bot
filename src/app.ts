import {DiscordBot} from "./app/discord-bot";
import Config from "./configuration";
import {getLogger} from "./utils/logger";
import MongoDB from "./data/db/service";
import {GoogleCloudDataSource} from "./data/datasources/google-cloud-datasource";

const logger = getLogger("app.js");

async function setup(): Promise<boolean> {
    if (!await MongoDB.start()) return false;
    return GoogleCloudDataSource.getInstance().setup();
}

async function main(): Promise<void> {
    if (!Config.parse()) {
        logger.error('Failed to parse configuration file, exiting...');
        process.exit(1);
    }

    if (await setup()) {
        const bot = new DiscordBot(Config.getDiscordToken());
        bot.run();
    } else {
        logger.error('Setup failed, exiting...');
        process.exit(1);
    }
}

(async (): Promise<void> => {
    await main();
})();
