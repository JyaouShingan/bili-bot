import {DiscordBot} from "./discord-bot";
import * as config from "../botconfig.json";
import {getLogger} from "./logger";

const logger = getLogger("app.js");

if (!config || !config.discordToken) {
    logger.error(`Missing botconfig.json or "discordToken" in json`);
}

let bot = new DiscordBot(config.discordToken);
bot.run();
