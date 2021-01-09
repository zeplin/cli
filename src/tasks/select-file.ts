import inquirer from "inquirer";
import inquirerFuzzyPath from "inquirer-fuzzy-path";
import * as fs from "fs-extra";
import path from "path";
import { Task, TaskStep, pauseSpinningAndExecuteTask, transitionTo } from "../util/task";
import { File, FileContext } from "./context/file";
import * as ui from "./ui/select-file";

inquirer.registerPrompt("fuzzypath", inquirerFuzzyPath);

const excludedPaths = [
    "node_modules",
    ".git"
    // TODO: add more excluded paths for other types of projects
];

function createFileMetadata(filepath: string): File {
    const absolutePath = path.resolve(filepath);
    return {
        name: path.basename(filepath),
        extension: path.extname(filepath),
        path: path.relative(process.cwd(), filepath),
        absolutePath
    };
}

const checkResourceFlags: TaskStep<FileContext> = async (ctx, task): Promise<void> => {
    if (ctx.cliOptions.filename) {
        const absolutePath = path.resolve(ctx.cliOptions.filename);

        if (!await fs.pathExists(absolutePath)) {
            task.fail(ctx, ui.fileNotFound);
            throw new Error(task.getCurrentText());
        }

        ctx.file = createFileMetadata(absolutePath);

        task.complete(ctx, ui.completed);
    }
};

const select: TaskStep<FileContext> = async (ctx): Promise<void> => {
    const { selection } = await inquirer.prompt([{
        type: "fuzzypath",
        name: "selection",
        itemType: "file",
        rootPath: ".",
        message: "Select the component file:",
        excludePath: (p: string): boolean => {
            for (const excludedPath of excludedPaths) {
                if (p.startsWith(excludedPath)) {
                    return true;
                }
            }
            return false;
        }
    }]);

    ctx.file = createFileMetadata(selection);
};

export const selectFile = new Task({
    steps: [
        checkResourceFlags,
        pauseSpinningAndExecuteTask(select),
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
