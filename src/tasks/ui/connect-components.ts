import { TaskUI } from "../../util/task/types";

export const initial = (): TaskUI => ({
    text: "Installing packages..."
});

export const skipConnect = (): TaskUI => ({
    text: "Skipped connecting components"
});

export const requiredPackagesAreNotInstalled = (): TaskUI => ({
    text: "Skipped connecting components",
    subtext: "Required package installation was skipped"
});

export const completed = (): TaskUI => ({
    text: "Connected components"
});
