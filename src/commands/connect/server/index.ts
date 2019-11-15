import express from "express";
import { ConnectedBarrelComponents, ConnectedComponent } from "../interfaces";
import { CLIError } from "../../../errors";
import { OK } from "http-status-codes";

export class ConnectDevServer {
    connectedBarrels: ConnectedBarrelComponents[] = [];

    constructor(connectedBarrels: ConnectedBarrelComponents[]) {
        this.connectedBarrels = connectedBarrels;
    }

    getConnectedComponents(barrelId: string): ConnectedComponent[] | null {
        const found = this.connectedBarrels.find(connectedBarrel =>
            connectedBarrel.projects.find(pid => pid === barrelId) ||
            connectedBarrel.styleguides.find(stid => stid === barrelId));

        return found ? found.connectedComponents : null;
    }

    start(port: number): Promise<void> {
        const app = express();

        // CORS
        app.use((_req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            next();
        });

        app.get("/:type/:barrelId/connectedcomponents", (req, res) => {
            const { barrelId } = req.params;

            const connectedComponents = this.getConnectedComponents(barrelId);

            return res.status(OK).json({ connectedComponents });
        });

        const promise = new Promise<void>((resolve, reject): void => {
            app.listen(port, resolve)
                .on("error", (err: NodeJS.ErrnoException) => {
                    if (err.code === "EADDRINUSE") {
                        reject(new CLIError(`Port ${port} is already in use.`));
                    }
                });
        });

        return promise;
    }
}

