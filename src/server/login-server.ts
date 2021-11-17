import express, { ErrorRequestHandler } from "express";
import { Server } from "http";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "http-status-codes";
import { Socket } from "net";

import { defaults } from "../config/defaults";
import { CLIError } from "../errors";
import logger from "../util/logger";

export class LoginServer {
    redirectPath: string;
    stopped = false;
    server: Server | undefined;
    connections: Socket[] = [];
    accessToken: string | undefined;

    constructor(redirectPath: string) {
        this.redirectPath = redirectPath;
    }

    start(port: number): Promise<Server> {
        if (this.server?.listening) {
            return Promise.resolve(this.server);
        }

        const app = express();

        // CORS
        app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", defaults.app.webURL);
            res.header("Access-Control-Allow-Headers", "*");
            res.header("Access-Control-Allow-Methods", "GET");

            if (req.method === "OPTIONS") {
                res.sendStatus(OK);
            } else {
                next();
            }
        });

        app.get(this.redirectPath, async (req, res) => {
            this.accessToken = req.query.access_token as string;

            if (!this.accessToken) {
                res.status(BAD_REQUEST).json({ error: "No access token" });
            } else {
                res.status(OK).json({ accessToken: this.accessToken });
            }

            await this.stop();
        });

        const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
            if (!res.headersSent) {
                res.status(err?.statusCode || INTERNAL_SERVER_ERROR).json({
                    detail: err?.message || "Unexpected Error",
                    title: err?.title || "Unexpected Error"
                });
            }
            next(err);
        };

        app.use(errorHandler);

        return new Promise<Server>((resolve, reject): void => {
            this.server = app.listen(port)
                .on("listening", () => {
                    logger.debug(`Started auth server on port ${port}`);

                    resolve(this.server as Server);
                })
                .on("error", (err: NodeJS.ErrnoException) => {
                    if (err.code === "EADDRINUSE") {
                        reject(new CLIError(`Port ${port} is already in use.`));
                    }
                })
                .on("connection", connection => {
                    this.connections.push(connection);
                    connection.on("close", () =>
                        (this.connections = this.connections.filter(curr => curr !== connection))
                    );
                });
        });
    }

    stop(): Promise<void> {
        if (this.stopped) {
            return Promise.resolve();
        }

        logger.debug("Stopping auth server.");

        this.stopped = true;
        this.connections.forEach(conn => conn.end());

        return new Promise((resolve): void => {
            this.server?.close(() => {
                logger.debug("Stopped auth server.");
                resolve();
            });
        });
    }

    async waitForToken(params: { port: number }): Promise<string | undefined> {
        await this.start(params.port);

        return new Promise<string | undefined>((resolve): void => {
            process.on("SIGINT", async () => {
                await this.stop();
            });

            this.server?.on("close", () => resolve(this.accessToken));
        });
    }
}
