import {DiscordBot} from "./discord-bot";
import * as config from "../botconfig.json";
import {getLogger} from "./utils/logger";
import MongoDB from "./data/db/service";

const logger = getLogger("app.js");

async function main(): Promise<void> {
    if (!config || !config['discordToken']) {
        logger.error(`Missing botconfig.json or "discordToken" in json`);
        return;
    }

    if (await MongoDB.start()) {
        const bot = new DiscordBot(config['discordToken']);
        bot.run();
    }
}

(async (): Promise<void> => {
    await main();
})();
