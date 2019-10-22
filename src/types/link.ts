export type UrlPath = Map<string, string>;

export interface ComponentData {
    lang: string;
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
