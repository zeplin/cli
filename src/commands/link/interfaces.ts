export interface LinkOptions {
    configFile: string;
    devMode: boolean;
    workingDirectory: string;
}

export type UrlPath = Map<string, string>;

export interface Url {
    name: string;
    type: string;
    url: string;
}

export interface ComponentConfig {
    name: string;
    path: string;
    urlPaths: UrlPath;
    zeplinNames: string[];
}

export interface LinkConfig {
    barrels: string[];
    baseUrls: Url[];
    components: ComponentConfig[];
}

export interface ComponentMetadata {
    name: string;
    path: string;
    description: string;
    urls: Url[];
    zeplinNames: string[];
}

export interface ComponentsMetadata {
    barrels: string[];
    components: ComponentMetadata[];
}

export interface LinkProcessor {
    process(context: LinkContext): void;
    supportsExtension(fileExt: string): boolean;
}

export interface LinkContext {
    fileList: string[];
    linkConfig: LinkConfig | null;
}
