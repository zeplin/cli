import { ComponentConfig, UrlPath } from "link";

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

export interface Content {
    lang: string;
    content: string;
}

export interface ProcessedComponent {
    path: string;
    zeplinNames: string[];
    description?: string;
    name?: string;
    urlPaths?: UrlPath;
    snippets?: Content[];
}

export interface ProcessedComponentList {
    components: ProcessedComponent[];
}

export interface ProcessedLinkConfig {
    barrels: string[];
    components: ProcessedComponent[];
}