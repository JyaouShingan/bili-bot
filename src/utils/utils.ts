import * as Promise from 'bluebird';
import * as youtubedl from "youtube-dl";

export const getInfo = Promise.promisify(youtubedl.getInfo);

export const uidExtractor = (url: string): string => {
    if (url.match(/bilibili/)) {
        return url.match(/av[0-9]*/)[0];
    } else { // youtube
        // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
        // Author: tsdorsey
        const re = /^(https?:\/\/)?((www\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-z-]+)/i;
        return url.match(re)[7];
    }
};

export const shuffle = <T>(array: T[]): void => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
