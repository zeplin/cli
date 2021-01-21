import { TaskUI } from "../../util/task";
import { AddComponentContext } from "../context/add-component";

export const initial = (): TaskUI => ({
    text: "Adding new component to configuration file..."
});

export const existingComponent = (): TaskUI => ({
    text: "Found a duplicate component"
});

export const abortDueToExistingComponent = (): TaskUI => ({
    text: "Aborted operation"
});

export const completed = (ctx: AddComponentContext): TaskUI => ({
    text: `New component is added into configuration file`,
    subtext: `${ctx.file.path}/${ctx.file.name}`
});
