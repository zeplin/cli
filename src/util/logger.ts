import winston, { format } from "winston";
import os from "os";
import stripAnsi from "strip-ansi";

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
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
});

export default logger;
