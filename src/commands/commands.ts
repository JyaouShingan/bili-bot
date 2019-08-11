import {Command, CommandType} from "./base-command";
import {InfoCommand} from "./info";

export const Commands = new Map<string, Command>([
    [CommandType.INFO, new InfoCommand()]
]);