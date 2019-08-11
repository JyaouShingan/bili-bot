import * as Promise from 'bluebird';
import * as youtubedl from "youtube-dl";

export const getInfo = Promise.promisify(youtubedl.getInfo);