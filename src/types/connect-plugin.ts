import { PrismLang } from "./prism";
import { ComponentConfigFile } from "../commands/connect/interfaces";

export type UrlPath = { [keys: string]: string };

export interface ComponentData {
    lang: PrismLang;
    description?: string;
    snippet?: string;
    link?: Link[];
}

export interface Link {
    name?: string;
    type: string;
    url: string;
}

export interface StorybookComponentConfig {
    kind: string;
    stories?: string[];
}

export interface StyleguidistComponentConfig {
    kind: string;
}

export interface CustomUrlConfig {
    urlPath: string;
}

export interface PluginConfig {
    [key: string]: string | number | boolean;
}

export interface PluginContext {
    plugin?: PluginConfig;
    global?: GlobalConfig;
}

export type GlobalConfig = Omit<ComponentConfigFile, "projects" | "styleguides" | "link" | "components">;

export type ComponentConfig = {
    path: string;
    zeplinNames: string[];
    name?: string;
    storybook?: StorybookComponentConfig;
    styleguidist?: StyleguidistComponentConfig;
} & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: CustomUrlConfig | any;
};

export interface ConnectPlugin {
    init?(context: PluginContext): Promise<void>;
    process(context: ComponentConfig): Promise<ComponentData>;
    supports(x: ComponentConfig): boolean;
}
