import os from "os";
import path from "path";
import { writeJsonIntoFile, readJsonFile } from "./file";

const TOKEN_FILE_NAME = ".zeplinrc";

interface AuthToken {
    authToken: string;
}

export function getTokenFileName(): string {
    return path.join(os.homedir(), TOKEN_FILE_NAME);
}

export async function saveAuthToken(authToken: string): Promise<void> {
    const tokenFilename = path.join(os.homedir(), TOKEN_FILE_NAME);

    await writeJsonIntoFile(tokenFilename, { authToken });
}

export async function readAuthToken(): Promise<string | undefined> {
    const tokenFilename = path.join(os.homedir(), TOKEN_FILE_NAME);

    let authToken;

    try {
        ({ authToken } = await readJsonFile(tokenFilename) as AuthToken);
    } catch (error) {
        // Ignore
        // TODO add logging utility for verbose logs
    }

    return authToken;
}