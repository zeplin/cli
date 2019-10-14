import { ComponentConfig, LinkProcessor } from "link";

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

export interface Data {
    processor: string;
    lang: string;
    description?: string;
    snippet?: string;
}

export interface ProcessedComponent {
    path: string;
    zeplinNames: string[];
    name?: string;
    urlPaths?: Url[];
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
