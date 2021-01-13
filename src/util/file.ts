import fs from "fs-extra";
import path from "path";

function getAsRelativePath(filePath: string): string {
    return path.isAbsolute(filePath) ? path.relative(process.cwd(), filePath) : filePath;
}

async function pathExists(filePath: string): Promise<boolean> {
    const resolvedFilePath = path.resolve(filePath);

    const exists = await fs.pathExists(resolvedFilePath);

    return exists;
}

async function readJsonFile(filePath: string): Promise<{}> {
    const resolvedFilePath = path.resolve(filePath);
    if (!(await fs.pathExists(resolvedFilePath))) {
        throw new Error(`Cannot access file: ${filePath}`);
    }

    return fs.readJson(resolvedFilePath, { encoding: "utf-8" });
}

async function writeJsonIntoFile(filePath: string, content: {}): Promise<void> {
    await fs.writeJson(filePath, content, {
        encoding: "utf-8",
        spaces: 2
    });
}

export {
    getAsRelativePath,
    pathExists,
    readJsonFile,
    writeJsonIntoFile
};
