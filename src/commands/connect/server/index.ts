import express from "express";
import { Server } from "http";
import { OK } from "http-status-codes";
import { Socket } from "net";
import { CLIError } from "../../../errors";
import logger from "../../../util/logger";
import { ConnectedBarrelComponents, ConnectedComponent } from "../interfaces/api";

export class ConnectDevServer {
    connectedBarrels: ConnectedBarrelComponents[] = [];
    stopped = false;
    server: Server | undefined;
    connections: Socket[] = [];

    constructor(connectedBarrels: ConnectedBarrelComponents[]) {
        this.connectedBarrels = connectedBarrels;
    }

    getConnectedComponents(barrelId: string): ConnectedComponent[] | null {
        const found = this.connectedBarrels.find(connectedBarrel =>
            connectedBarrel.projects.find(pid => pid === barrelId) ||
            connectedBarrel.styleguides.find(stid => stid === barrelId));

        return found ? found.connectedComponents : null;
    }

    updateConnectedBarrels(connectedBarrels: ConnectedBarrelComponents[]): void {
        this.connectedBarrels = connectedBarrels;
    }

    start(port: number): Promise<Server> {
        if (this.server && this.server.listening) {
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

        app.get("/:type/:barrelId/connectedcomponents", (req, res) => {
            const { barrelId } = req.params;

            const connectedComponents = this.getConnectedComponents(barrelId);

            return res.status(OK).json({ connectedComponents });
        });

        return new Promise<Server>((resolve, reject): void => {
            this.server = app.listen(port)
                .on("listening", () => {
                    logger.debug(`Started dev server on port ${port}`);
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
        logger.debug("Stopping dev server.");

        this.stopped = true;
        this.connections.forEach(conn => conn.end());

        return new Promise((resolve): void => {
            this.server?.close(() => {
                logger.debug("Stopped dev server.");
                resolve();
            });
        });
    }
}
