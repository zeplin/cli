import { TaskUI } from "../../util/task";
import { InitializeContext } from "../context/initialize";

export const initial = (): TaskUI => ({
    text: "Generating configuration file..."
});

export const completed = (ctx: InitializeContext): TaskUI => ({
    text: `Generated configuration file`,
    subtext: `${ctx.cliOptions.output}`
});
