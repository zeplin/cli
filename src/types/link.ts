import { PrismLang } from "./prism";

export type UrlPath = { [keys: string]: string };

export interface ComponentData {
    lang: PrismLang;
    description: string;
    snippet: string;
}

export interface ComponentConfig {
    path: string;
    zeplinNames: string[];
    name?: string;
    urlPaths?: UrlPath;
}

export interface ZeplinLinkPlugin {
    process(context: ComponentConfig): Promise<ComponentData>;
    supports(x: ComponentConfig): boolean;
}
