/** @internal */
export interface File {
    name: string;
    extension: string;
    path: string;
    absolutePath: string;
}

/** @internal */
export interface FileContext {
    filename?: string;
    file?: File;
}
