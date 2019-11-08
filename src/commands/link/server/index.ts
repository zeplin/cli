import express from "express";
import { LinkedBarrelComponents, LinkedComponent } from "../interfaces";
import { CLIError } from "../../../errors";

const HTTP_OK = 200;

export class DevServer {
    linkedBarrels: LinkedBarrelComponents[] = [];

    constructor(linkedBarrels: LinkedBarrelComponents[]) {
        this.linkedBarrels = linkedBarrels;
    }

    getLinkedComponents(barrelId: string): Promise<LinkedComponent[]> {
        return new Promise((resolve, reject): void => {
            const found = this.linkedBarrels.find(linkedBarrel =>
                linkedBarrel.projects.find(pid => pid === barrelId) ||
                linkedBarrel.styleguides.find(stid => stid === barrelId));

            if (found) {
                resolve(found.connectedComponents);
            } else {
                reject(new Error("Components could not be found for the requested project or styleguide."));
            }
        });
    }

    start(port: number): Promise<void> {
        const app = express();

        // CORS
        app.use((_req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            next();
        });

        app.get("/:type/:barrelId/connectedcomponents", async (req, res) => {
            const { barrelId } = req.params;

            try {
                const connectedComponents = await this.getLinkedComponents(barrelId);

                return res.status(HTTP_OK).json({ connectedComponents });
            } catch (error) {
                return res.status(HTTP_OK).json({ connectedComponents: null }); // TODO: should return 404?
            }
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

