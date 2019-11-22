import { ComponentConfig, ConnectPlugin } from "connect-plugin";

export interface Link {
    name?: string;
    type: string;
    url: string;
}

export interface GithubConfig {
    repository: string;
    branch?: string;
    url?: string;
    path?: string;
}

export interface ComponentConfigFile {
    projects?: string[];
    styleguides?: string[];
    links: Link[];
    components: ComponentConfig[];
    github?: GithubConfig;
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
    urlPaths?: Link[];
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
