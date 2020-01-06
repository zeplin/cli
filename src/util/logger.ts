import winston, { format } from "winston";
import os from "os";
import stripAnsi from "strip-ansi";

const logLevels = {
    http: 5,
    debug: 4,
    info: 3,
    console: 2,
    warn: 1,
    error: 0
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: "http",
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
                format.printf(m => stripAnsi(`${m.timestamp} - ${m.level} - ${m.message}${m.stack ? `\n${m.stack}` : ""}`))
            )
        }),
        new winston.transports.Console({
            level: "info",
            stderrLevels: ["error"],
            format: format.combine(
                format.splat(),
                format.printf(m => `${m.message}`)
            )
        })
    ]
}) as winston.Logger & Record<keyof typeof logLevels, winston.LeveledLogMethod>;

export default logger;
