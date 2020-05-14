import winston, { format } from "winston";
import os from "os";
import stripAnsi from "strip-ansi";
import { EventEmitter } from "events";

const fileTransport = new winston.transports.File({
    level: "silly",
    filename: "cli.log",
    maxsize: 1048576, // 1 MB
    maxFiles: 2,
    dirname: `${os.homedir()}/.zeplin`,
    tailable: true,
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.printf(m =>
            stripAnsi(`${m.timestamp} - ${m.level} - ${m.message}${m.stack ? `\n${m.stack}` : ""}`)
                .replace(/\r?\n/g, "")
        )
    )
});

const consoleTransport = new winston.transports.Console({
    level: "info",
    stderrLevels: ["error"],
    format: format.combine(
        format.splat(),
        format.printf(m => `${m.message}`)
    )
});

const logger = winston.createLogger({
    transports: [
        fileTransport,
        consoleTransport
    ]
});

// Workaround to ensure all logs are written into the file before process exit
const fileLogWatcher = new EventEmitter();
fileTransport.on("open", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    fileTransport._dest.on("finish", () => {
        fileLogWatcher.emit("finish");
    });
});

const waitForLoggerFinish = (): Promise<never> => new Promise((resolve): void => {
    fileLogWatcher.on("finish", (): void => {
        resolve();
    });
    logger.end();
});

export default logger;
export {
    waitForLoggerFinish
};