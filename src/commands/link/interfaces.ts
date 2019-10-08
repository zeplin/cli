import { ComponentConfig, UrlPath, LinkProcessor } from "link";

export interface Url {
    name: string;
    type: string;
    url: string;
}
export interface LinkConfig {
    projects?: string[];
    styleguides?: string[];
    baseURLs: Url[];
    components: ComponentConfig[];
}

export type UrlPath = Map<string, string>;

export interface Data {
    proccessor: string;
    lang: string;
    description?: string;
    snippet?: string;
}

export interface ProcessedComponent {
    path: string;
    zeplinNames: string[];
    name?: string;
    urlPaths?: UrlPath;
    data?: Data[];
}

export interface ProcessedComponentList {
    components: ProcessedComponent[];
}

export interface ProcessedLinkConfig {
    projects?: string[];
    styleguides?: string[];
    components: ProcessedComponent[];
}

export interface LinkProcessorModule extends LinkProcessor {
    name: string;
}
