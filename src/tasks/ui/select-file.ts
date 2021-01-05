import { TaskUI } from "../../util/task";
import { FileContext } from "../context/file";

export const initial = (): TaskUI => ({
    text: "Select a component file"
});

export const fileNotFound = (ctx: FileContext): TaskUI => ({
    text: `Could not find file ${ctx.filename}`
});

export const completed = (ctx: FileContext): TaskUI => ({
    text: `Selected component file`,
    subtext: `${ctx.file?.path}`
});
