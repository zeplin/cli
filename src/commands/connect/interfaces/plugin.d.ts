import { PrismLang } from "./prism";

/**
 * @public
 */
interface LeveledLogMethod {
    (message: string): void;
    (message: string, meta: unknown): void;
    (message: string, ...meta: any[]): void;
    (infoObject: object): void;
}

/**
 * Contains custom plugin configuration and logger
 *
 * @public
 */
export interface PluginContext {
    /** {@inheritdoc PluginConfig} */
    config?: PluginConfig;
    /** {@inheritdoc ComponentConfig} */
    components: ComponentConfig[];
    logger: Logger;
}

/**
 * Custom created link for a component
 *
 * @public
 */
export interface Link {
    /** Name of the link */
    name?: string;
    /** Full URL to the resource */
    url: string;
    /**
     * Type of the link.
     * Required to show a pretty link for certain types of links on Zeplin.
     */
    type: LinkType;
}

/**
 * Link types for application link logo
 * Use `LinkType.custom` if you are not sure what to do
 * @public
 */
export const enum LinkType {
    styleguidist = "styleguidist",
    storybook = "storybook",
    github = "github",
    gitlab = "gitlab",
    bitbucket = "bitbucket",
    custom = "custom"
}

/**
 * Contains processed component data
 *
 * @public
 */
export interface ComponentData {
    /** Description of the component */
    description?: string;
    /** Language of the snippet for highlighting */
    lang?: PrismLang;
    /** Code snippet of the component */
    snippet?: string;
    /** {@inheritdoc Link} */
    links?: Link[];
}

/**
 * @public
 */
export interface StyleguidistComponentConfig {
    name: string;
}

/**
 * Arbitrary key/values for custom plugin configuration.
 *
 * @public
 */
export interface PluginConfig {
    [key: string]: unknown;
}

/**
 * Contains basic configuration for a component.
 *
 * @public
 */
export interface ComponentConfigBase {
    /** Path to the file, relative to project folder. */
    path: string;
    /** Zeplin component names related to this component file */
    zeplinNames?: string[];
    /** Zeplin component source IDs related to this component file */
    zeplinIds?: string[];
    /** Name for the component */
    name?: string;
    /** Styleguidist name for the component (Optional) */
    styleguidist?: StyleguidistComponentConfig;
}

/**
 * Use it as a value of {@link ComponentConfigCustom} keys for custom link composition
 *
 * @public
 */
export interface CustomUrlConfig {
    urlPath: string;
}

/**
 * Custom key/value configuration for a component.
 * Can be used to compose custom links for components
 * or can be processed by plugins for custom usage.
 *
 * @public
 */
export interface ComponentConfigCustom {
    [key: string]: CustomUrlConfig | unknown;
}

/**
 * Union of {@link ComponentConfigBase} and {@link ComponentConfigCustom}
 *
 * @public
 */
export type ComponentConfig = ComponentConfigBase & ComponentConfigCustom;

/**
 * Interface for Zeplin CLI Connected Components plugins
 *
 * @public
 */
export interface ConnectPlugin {
    /**
     * CLI invokes this method once the package is loaded.
     * PluginContext contains arbitrary configuration set for the plugin
     * on components config file.
     *
     * This method is optional. Implement it to initialize plugin locals etc.
     * based on plugin configuration.
     *
     *
     * @param pluginContext - {@link PluginContext}
     */
    init?(pluginContext: PluginContext): Promise<void>;

    /**
     * CLI invokes this method for each component in the configration file.
     *
     * @param componentConfig - {@link ComponentConfig}
     * @returns - {@link ComponentData}
    */
    process(componentConfig: ComponentConfig): Promise<ComponentData>;

    /**
     * CLI invokes this method for each component in the configuration file
     * to determine if this plugin should process this component
     *
     * @param componentConfig - {@link ComponentConfig}
     * @returns true if the plugin supports the component, false otherwise
    */
    supports(componentConfig: ComponentConfig): boolean;
}

/**
 * Interface for Zeplin CLI's logger.
 *
 * @public
 */
export interface Logger {
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;
}