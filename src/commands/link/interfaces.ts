import { ComponentConfig, ZeplinLinkPlugin } from "link";

export interface Url {
    name: string;
    type: string;
    url: string;
}
export interface ComponentConfigFile {
    projects?: string[];
    styleguides?: string[];
    baseURLs: Url[];
    components: ComponentConfig[];
}

export interface Data {
    plugin: string;
    lang: string;
    description?: string;
    snippet?: string;
}

export interface LinkedComponent {
    path: string;
    zeplinNames: string[];
    name?: string;
    urlPaths?: Url[];
    data?: Data[];
}

export interface LinkedComponentList {
    linkedComponents: LinkedComponent[];
}

export interface LinkedBarrelComponents {
    projects?: string[];
    styleguides?: string[];
    linkedComponents: LinkedComponent[];
}

export interface ZeplinLinkPluginModule extends ZeplinLinkPlugin {
    name: string;
}
