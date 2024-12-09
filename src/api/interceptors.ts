import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import maskJson from "mask-json";
import logger from "../util/logger";
import { URL } from "url";
import { MOVED_TEMPORARILY } from "http-status-codes";

const blacklist = ["password", "token", "Zeplin-Access-Token", "Zeplin-Token", "Location"];

const blacklistedQueryParams = ["access_token"];

const mask = maskJson(blacklist, {
    ignoreCase: true
});

const maskUrl = (_url: string | undefined): string | undefined => {
    let masked = _url;
    try {
        if (_url) {
            const url = new URL(_url);

            blacklistedQueryParams
                .filter(param => url.searchParams.has(param))
                .forEach(param => url.searchParams.set(param, "--REDACTED--"));

            masked = url.toString();
        }
    } catch {
        // Ignore
    }
    return masked;
};

// https://github.com/axios/axios/issues/5494#issuecomment-1402663237
const requestLogger = (request: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const {
        url,
        method,
        data,
        headers,
        params
    } = request;
    let httpLog = `HTTP Request: ${method} ${maskUrl(url)}`;

    if (headers) {
        httpLog = httpLog.concat(`, Headers: ${JSON.stringify(mask(headers))}`);
    }
    if (data) {
        httpLog = httpLog.concat(`, Body: ${JSON.stringify(mask(data))}`);
    }
    if (params) {
        httpLog = httpLog.concat(`, Params: ${JSON.stringify(mask(params))}`);
    }

    logger.http(httpLog);

    return request;
};

const responseLogger = (response: AxiosResponse): AxiosResponse => {
    const {
        config: { url, method },
        status,
        statusText,
        headers,
        data
    } = response;

    let httpLog = `HTTP Response: ${method} ${maskUrl(url)}`
        .concat(`, Status: ${status}-${statusText}`);

    if (headers) {
        httpLog = httpLog.concat(`, Headers: ${JSON.stringify(mask(headers))}`);
    }
    if (data) {
        // 302 may contain sensitive query params
        if (status !== MOVED_TEMPORARILY) {
            httpLog = httpLog.concat(`, Body: ${JSON.stringify(mask(data))}`);
        }
    }

    logger.http(httpLog);

    return response;
};

export const interceptors = {
    request: [requestLogger],
    response: [responseLogger]
};
