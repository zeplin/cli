import fs from "fs-extra";
import path from "path";

export async function readJsonFile(filePath: string): Promise<{}> {
    const resolvedFilePath = path.resolve(filePath);
    if (!(await fs.pathExists(resolvedFilePath))) {
        throw new Error(`Cannot access file: ${filePath}`);
    }

    return fs.readJson(resolvedFilePath);
}

export async function writeJsonIntoFile(filePath: string, content: {}): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(content));
}

export function transformAbsolutePathToRelativePath(filePath: string): string {
    return path.isAbsolute(filePath) ? path.relative(process.cwd(), filePath) : filePath;
}