export interface File {
    name: string;
    extension: string;
    path: string;
    absolutePath: string;
}

export interface FileContext {
    cliOptions: {
        filename?: string;
    };
    file: File;
}
