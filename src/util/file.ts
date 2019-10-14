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

export async function getAllFilesFromFolder(folderPath: string): Promise<string[]> {
    let results: string[] = [];

    const resolvedFolderPath = path.resolve(folderPath);

    const folderContent = await fs.readdir(resolvedFolderPath);
    await Promise.all(folderContent.map(async file => {
        const filePath = path.resolve(resolvedFolderPath, file);

        const stat = await fs.stat(filePath);
        if (stat && stat.isDirectory()) {
            const innerResults = await getAllFilesFromFolder(filePath);
            results = results.concat(innerResults);
        } else {
            results.push(file);
        }
    }));

    return results;
}