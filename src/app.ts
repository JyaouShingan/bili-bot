import {DiscordBot} from "./discord-bot";
import * as config from "../botconfig.json";
import {getLogger} from "./logger";
import {MongoDB} from "./database/mongo-service";

const logger = getLogger("app.js");

if (!config || !config.discordToken) {
    logger.error(`Missing botconfig.json or "discordToken" in json`);
}

if (MongoDB.start()) {
    let bot = new DiscordBot(config.discordToken);
    bot.run();
}
