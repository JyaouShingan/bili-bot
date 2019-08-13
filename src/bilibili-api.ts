import {getLogger} from './logger';
import * as request from "request-promise";
import RandomMapping from './const/random-mapping';

const logger = getLogger('BilibiliApi');
const apiBaseUrl = "https://api.imjad.cn/bilibili/v2";

export class SearchSongEntity {
    public title: string;
    public videoId: string;
    public author: string;
    public play: number;

    public setTitle(title: string): this {
        this.title = title;
        return this;
    }

    public setVideoId(id: string): this {
        this.videoId = id;
        return this;
    }

    public setAuthor(author: string): this {
        this.author = author;
        return this;
    }

    public setPlay(play: number): this {
        this.play = play;
        return this;
    }

    public getUrl(): string {
        return `https://www.bilibili.com/video/av${this.videoId}`;
    }
}

export async function search(keyword: string, limit?: number): Promise<SearchSongEntity[]> {
    const params = {
        get: "search",
        keyword,
    };
    if (limit) params['pagesize'] = limit;

    const req = {
        uri: apiBaseUrl,
        qs: params,
        json: true
    };

    const response = await request(req);
    const rawSongs = response['data']['items']['archive'] as object[];
    if (!rawSongs) return [];
    return rawSongs.map((raw): SearchSongEntity => {
        return new SearchSongEntity()
            .setTitle(raw['title'])
            .setAuthor(raw['author'])
            .setVideoId(raw['param'])
            .setPlay(raw['play']);
    });
}

export async function randomRanking(
    catagory: string,
    type: string,
): Promise<SearchSongEntity> {
    const content = RandomMapping[catagory] || 1;
    const params = {
        get: "rank",
        type,
        content,
    };

    const req = {
        uri: apiBaseUrl,
        qs: params,
        json: true
    };

    const response = await request(req);
    const rawSongs = response['rank']['list'];
    const randomIndex = Math.floor(Math.random() * rawSongs.length);
    const raw = rawSongs[randomIndex];
    logger.info(`Random result av${raw["aid"]} selected from Bilibili`);
    return new SearchSongEntity()
        .setTitle(raw['title'])
        .setAuthor(raw['author'])
        .setVideoId(raw['aid'])
        .setPlay(raw['play']);
}
