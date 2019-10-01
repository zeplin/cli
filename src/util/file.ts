import fs from "fs-extra";
import path from "path";

export async function readJsonFile(filePath: string): Promise<{}> {
    if (!(await fs.pathExists(filePath))) {
        throw new Error(`Cannot access file: ${filePath}`);
    }

    const fileBuffer = await fs.readFile(filePath);
    return JSON.parse(fileBuffer.toString());
}

export async function getAllFilesFromFolder(folderPath: string): Promise<string[]> {
    let results: string[] = [];

    (await fs.readdir(folderPath)).forEach(async file => {
        const filePath = path.join(folderPath, file);

        const stat = await fs.stat(filePath);
        if (stat && stat.isDirectory()) {
            const innerResults = await getAllFilesFromFolder(filePath);
            results = results.concat(innerResults);
        } else {
            results.push(file);
        }
    });

    return results;
}