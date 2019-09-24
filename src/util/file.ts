import fs from "fs";
import path from "path";

export function readJsonFile(filePath: string): {} {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Cannot access file: ${filePath}`);
    }

    return JSON.parse(fs.readFileSync(filePath).toString());
}

export function getAllFilesFromFolder(folderPath: string): string[] {
    let results: string[] = [];

    fs.readdirSync(folderPath).forEach(file => {
        const filePath = path.join(folderPath, file);

        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesFromFolder(filePath));
        } else {
            results.push(file);
        }
    });

    return results;
}