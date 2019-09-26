export type UrlPath = Map<string, string>;

export interface ComponentCode {
    description: string;
    snippet: string;
}

export interface ComponentConfig {
    path: string;
    zeplinNames: string[];
    name?: string;
    urlPaths?: UrlPath;
}

export interface LinkProcessor {
    process(context: ComponentConfig): Promise<ComponentCode>;
    supports(x: ComponentConfig): boolean;
    getLang(): string;
}
