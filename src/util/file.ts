import fs from "fs-extra";
import path from "path";

export async function readJsonFile(filePath: string): Promise<{}> {
    if (!(await fs.pathExists(filePath))) {
        throw new Error(`Cannot access file: ${filePath}`);
    }

    return fs.readJson(filePath);
}

export async function writeJsonIntoFile(filePath: string, content: {}): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(content));
}

export async function getAllFilesFromFolder(folderPath: string): Promise<string[]> {
    let results: string[] = [];

    const folderContent = await fs.readdir(folderPath);
    await Promise.all(folderContent.map(async file => {
        const filePath = path.join(folderPath, file);

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