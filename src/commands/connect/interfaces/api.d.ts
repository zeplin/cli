import { Link } from "./plugin";

/** @internal */
export interface Data {
    plugin: string;
    lang?: string;
    description?: string;
    snippet?: string;
}

/** @internal */
export interface ConnectedComponent {
    path: string;
    zeplinNames: string[];
    name?: string;
    urlPaths?: Link[];
    data?: Data[];
}

/** @internal */
export interface ConnectedComponentList {
    connectedComponents: ConnectedComponent[];
}

/** @internal */
export interface ConnectedBarrelComponents {
    projects: string[];
    styleguides: string[];
    connectedComponents: ConnectedComponent[];
}

/** @internal */
export interface ConnectedBarrels {
    projects: string[];
    styleguides: string[];
}