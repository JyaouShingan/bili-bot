import {Logger, getLogger} from "./logger";

export class GuildManager {
    logger: Logger;

    id: string;
    active: boolean;

    constructor() {
        this.logger = getLogger("GuildManager");
    }
}