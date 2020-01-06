import { AxiosRequestConfig, AxiosResponse } from "axios";
import logger from "../util/logger";

const requestLogger = (request: AxiosRequestConfig): AxiosRequestConfig => {
    const { url, method, data, headers } = request;
    let httpLog = `HTTP Request: ${method} ${url}`;

    if (headers) {
        httpLog = httpLog.concat(`, Headers: ${JSON.stringify(headers)}`);
    }
    if (data) {
        httpLog = httpLog.concat(`, Body: ${JSON.stringify(data)}`);
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
        httpLog = httpLog.concat(`, Headers: ${JSON.stringify(headers)}`);
    }

    if (data) {
        httpLog = httpLog.concat(`, Body: ${JSON.stringify(data)}`);
    }

    logger.http(httpLog);

    return response;
};

export const interceptors = {
    request: [requestLogger],
    response: [responseLogger]
};