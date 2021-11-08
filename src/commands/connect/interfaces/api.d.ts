import { Link } from "./plugin";

/** @internal */
export type ConnectedComponentItem = (
    ({ componentId: string } | { pattern: string })
    & {
        name?: string;
        description?: string;
        filePath?: string;
        code?: {
            snippet: string;
            lang?: string;
        };
        links?: Link[];
    }
);

/** @internal */
export interface ConnectedComponents {
    items: ConnectedComponentItem[];
}

/** @internal */
export interface ConnectedBarrelComponents {
    projects: string[];
    styleguides: string[];
    items: ConnectedComponentItem[];
}

/** @internal */
export interface ConnectedBarrels {
    projects: string[];
    styleguides: string[];
}
