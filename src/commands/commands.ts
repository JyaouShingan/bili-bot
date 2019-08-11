import {Command, CommandType} from "./base-command";
import {InfoCommand} from "./info";
import {PlayCommand} from "./play";
import {PauseCommand} from "./pause";
import {ResumeCommand} from "./resume";
import {NextCommand} from "./next";
import {StopCommand} from "./stop";
import {ClearCommand} from "./clear";
import {ShuffleCommand} from "./shuffle";
import {LeaveCommand} from "./leave";
import {SaveCommand} from "./save";
import {LoadCommand} from "./load";
import {ListCommand} from "./list";
import {PromoteCommand} from "./promote";
import {SearchCommand} from "./search";
import {SelectCommand} from "./select";
import {RandomCommand} from "./random";
import {ShowlistCommand} from "./showlist";

export const Commands = new Map<string, Command>([
    [CommandType.INFO, new InfoCommand()],
    [CommandType.PLAY, new PlayCommand()],
    [CommandType.PAUSE, new PauseCommand()],
    [CommandType.RESUME, new ResumeCommand()],
    [CommandType.NEXT, new NextCommand()],
    [CommandType.STOP, new StopCommand()],
    [CommandType.CLEAR, new ClearCommand()],
    [CommandType.SHUFFLE, new ShuffleCommand()],
    [CommandType.LEAVE, new LeaveCommand()],
    [CommandType.SAVE, new SaveCommand()],
    [CommandType.LOAD, new LoadCommand()],
    [CommandType.LIST, new ListCommand()],
    [CommandType.PROMOTE, new PromoteCommand()],
    [CommandType.SEARCH, new SearchCommand()],
    [CommandType.SELECT, new SelectCommand()],
    [CommandType.RANDOM, new RandomCommand()],
    [CommandType.SHOWLIST, new ShowlistCommand()]
]);