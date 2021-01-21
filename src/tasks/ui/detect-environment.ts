import { TaskUI } from "../../util/task/types";

export const initial = (): TaskUI => ({
    text: "Detecting environment..."
});

export const completed = (): TaskUI => ({
    text: "Detected environment"
});
