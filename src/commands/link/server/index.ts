import express from "express";
import { LinkedBarrelComponents, LinkedComponent } from "../interfaces";
import { CLIError } from "../../../errors";
import { OK } from "http-status-codes";

export class DevServer {
    linkedBarrels: LinkedBarrelComponents[] = [];

    constructor(linkedBarrels: LinkedBarrelComponents[]) {
        this.linkedBarrels = linkedBarrels;
    }

    getLinkedComponents(barrelId: string): LinkedComponent[] | null {
        const found = this.linkedBarrels.find(linkedBarrel =>
            linkedBarrel.projects.find(pid => pid === barrelId) ||
            linkedBarrel.styleguides.find(stid => stid === barrelId));

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

        app.get("/public/cli/:type/:barrelId/connectedcomponents", (req, res) => {
            const { barrelId } = req.params;

            const connectedComponents = this.getLinkedComponents(barrelId);

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

