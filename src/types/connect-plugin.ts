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

export interface ComponentConfig {
    path: string;
    zeplinNames: string[];
    name?: string;
    storybook?: StorybookConfig;
    styleguidist?: StyleguidistConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Custom config
}

export interface ConnectPlugin {
    process(context: ComponentConfig): Promise<ComponentData>;
    supports(x: ComponentConfig): boolean;
}
