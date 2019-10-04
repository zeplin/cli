import os from "os";
import path from "path";
import { writeJsonIntoFile, readJsonFile } from "./file";

const TOKEN_FILE_NAME = ".zeplinrc";

interface AuthToken {
    authToken: string;
}

export async function saveAuthToken(authToken: string): Promise<void> {
    const tokenFilename = path.join(os.homedir(), TOKEN_FILE_NAME);

    await writeJsonIntoFile(tokenFilename, { authToken });
}

export async function readAuthToken(): Promise<string> {
    const tokenFilename = path.join(os.homedir(), TOKEN_FILE_NAME);

    const { authToken } = await readJsonFile(tokenFilename) as AuthToken;

    return authToken;
}