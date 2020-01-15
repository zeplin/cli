import { AxiosRequestConfig, AxiosResponse } from "axios";
import maskJson from "mask-json";
import logger from "../util/logger";

const blacklist = ["password", "Zeplin-Access-Token", "Zeplin-Token"];

const mask = maskJson(blacklist);

const requestLogger = (request: AxiosRequestConfig): AxiosRequestConfig => {
    const { url, method, data, headers } = request;
    let httpLog = `HTTP Request: ${method} ${url}`;

    if (headers) {
        httpLog = httpLog.concat(`, Headers: ${JSON.stringify(mask(headers))}`);
    }
    if (data) {
        httpLog = httpLog.concat(`, Body: ${JSON.stringify(mask(data))}`);
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

    let httpLog = `HTTP Response: ${method} ${url}`
        .concat(`, Status: ${status}-${statusText}`);

    if (headers) {
        httpLog = httpLog.concat(`, Headers: ${JSON.stringify(mask(headers))}`);
    }
    if (data) {
        httpLog = httpLog.concat(`, Body: ${JSON.stringify(mask(data))}`);
    }

    logger.http(httpLog);

    return response;
};

export const interceptors = {
    request: [requestLogger],
    response: [responseLogger]
};