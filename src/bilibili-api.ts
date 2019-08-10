import {getLogger} from './logger';
import * as request from "request-promise";
import RandomMapping from './const/random-mapping';

const logger = getLogger('BilibiliApi');
const apiBaseUrl = "https://api.imjad.cn/bilibili/v2";

export class SearchSongEntity {
    title: string;
    videoId: string;
    author: string;
    play: number;

    setTitle(title: string): this {
        this.title = title;
        return this;
    }

    setVideoId(id: string): this {
        this.videoId = id;
        return this;
    }

    setAuthor(author: string): this {
        this.author = author;
        return this;
    }

    setPlay(play: number): this {
        this.play = play;
        return this;
    }

    getUrl(): string {
        return `https://www.bilibili.com/video/av${this.videoId}`;
    }
}

export function search(keyword: string, limit?: number): Promise<SearchSongEntity[]> {
    let params = {
        get: "search",
        keyword,
    };
    if (limit) params['pagesize'] = limit;

    let req = {
        uri: apiBaseUrl,
        qs: params,
        json: true
    };
    return request(req).then((res) => {
        const rawSongs = res['data']['items']['archive'] as object[];

        if (!rawSongs) return [];
        return rawSongs.map((raw) => {
            return new SearchSongEntity()
                .setTitle(raw['title'])
                .setAuthor(raw['author'])
                .setVideoId(raw['param'])
                .setPlay(raw['play']);
        });
    });
}

export function randomRanking(
    catagory: string,
    type: string, 
): Promise<SearchSongEntity> {
    const content = RandomMapping[catagory] || 1;
    const params = {
        get: "rank",
        type,
        content,
    };

    let req = {
        uri: apiBaseUrl,
        qs: params,
        json: true
    };
    return request(req).then((res) => {
        const rawSongs = res['rank']['list'];
        const randomIndex = Math.floor(Math.random() * rawSongs.length);
        const raw = rawSongs[randomIndex];
        logger.info(`Random result av${raw["aid"]} selected from Bilibili`);
        return new SearchSongEntity()
            .setTitle(raw['title'])
            .setAuthor(raw['author'])
            .setVideoId(raw['aid'])
            .setPlay(raw['play']);
    });
}