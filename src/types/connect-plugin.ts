import { PrismLang } from "./prism";

export type UrlPath = { [keys: string]: string };

export interface ComponentData {
    lang: PrismLang;
    description?: string;
    snippet?: string;
}

export interface StorybookConfig {
    kind: string;
    stories?: string[];
}

export interface StyleguidistConfig {
    kind: string;
}

export interface CustomUrlConfig {
    urlPath: string;
}

export type ComponentConfig = {
    path: string;
    zeplinNames: string[];
    name?: string;
    storybook?: StorybookConfig;
    styleguidist?: StyleguidistConfig;
} & { [key: string]: CustomUrlConfig};

export interface ConnectPlugin {
    process(context: ComponentConfig): Promise<ComponentData>;
    supports(x: ComponentConfig): boolean;
}
