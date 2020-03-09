import {DiscordBot} from "./app/discord-bot";
import Config from "./configuration";
import {getLogger} from "./utils/logger";
import MongoDB from "./data/db/service";
import {GoogleCloudDataSource} from "./data/datasources/google-cloud-datasource";
import * as fs from 'fs';
import * as path from 'path';
import exitHook = require("exit-hook");

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

    // Setup exiting hook
    exitHook((): void => {
        // Clear up cache folder
        logger.info('Exiting, cleaning up cache...');
        const cacheDir = Config.getLocalCacheDirectory();
        const files = fs.readdirSync(cacheDir);
        for (const file of files) {
            fs.unlinkSync(path.join(cacheDir, file));
        }
    });

    if (await setup()) {
        const bot = new DiscordBot(Config.getDiscordToken());
        bot.run();
    } else {
        logger.error('Setup failed, exiting...');
        process.exit(1);
    }
}

main();
