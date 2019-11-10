import { ComponentConfig, ConnectPlugin } from "connect-plugin";

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

export interface ConnectedComponent {
    path: string;
    zeplinNames: string[];
    name?: string;
    urlPaths?: Url[];
    data?: Data[];
}

export interface ConnectedComponentList {
    connectedComponents: ConnectedComponent[];
}

export interface ConnectedBarrelComponents {
    projects: string[];
    styleguides: string[];
    connectedComponents: ConnectedComponent[];
}

export interface ConnectPluginModule extends ConnectPlugin {
    name: string;
}
