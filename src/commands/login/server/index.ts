import express, { ErrorRequestHandler } from "express";
import { Server } from "http";
import { BAD_REQUEST, OK } from "http-status-codes";
import methodOverride from "method-override";
import { Socket } from "net";

import { CLIError } from "../../../errors";
import logger from "../../../util/logger";

export class LoginAuthServer {
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
        app.use((_req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin");
            res.header("Access-Control-Allow-Methods", "GET");
            next();
        });

        app.get(this.redirectPath, async (req, res, next) => {
            this.accessToken = req.query.access_token;

            if (!this.accessToken) {
                next(new Error("No access token!"));
            } else {
                // TODO: Render meaningful views
                res.status(OK).json(`Got access token: ${this.accessToken}`);

                await this.stop();
            }
        });

        app.use(methodOverride());
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const errorHandler: ErrorRequestHandler = async (err, req, res, _next) => {
            // TODO: Render meaningful views
            res.status(BAD_REQUEST).json({ error: err.message });

            if (req.path === this.redirectPath) {
                await this.stop();
            }
        };

        app.use(errorHandler);

        return new Promise<Server>((resolve, reject): void => {
            this.server = app.listen(port)
                .on("listening", () => {
                    logger.debug(`Started auth server on port ${port}`);

                    resolve(this.server);
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
                resolve(this.accessToken);
            });

            this.server?.on("close", () => resolve(this.accessToken));
        });
    }
}
