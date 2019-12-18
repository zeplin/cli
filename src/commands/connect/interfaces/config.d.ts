import { ConnectPlugin, ComponentConfig, PluginConfig } from "./plugin";
/** @public */
export interface GithubConfig {
    /** Repository name */
    repository: string;
    /**
     * The branch name which the Github links will open
     * @defaultValue master
     */
    branch?: string;
    /**
     * Custom url for self-hosted Github Enterprise
     * @defaultValue https://github.com
     */
    url?: string;
    /**
     * Optional path to the project on monorepos.
     */
    path?: string;
}

/** @public */
export interface Plugin {
    /** NPM package name of the plugin */
    name: string;
    /** {@inheritdoc PluginConfig} */
    config?: PluginConfig;
}

/**
 * Base URLs for custom link composition
 *
 * @public
 */
export interface LinkConfig {
    /** Name of the link */
    name?: string;
    /** Base URL to the resource */
    url: string;
    /** Type of the link */
    type: string;
}

/**
 * Component configuration structure
 *
 * @public
 */
export interface ComponentConfigFile {
    /** Zeplin project IDs which the components belong to */
    projects?: string[];

    /** Zeplin styleguide IDs which the components belong to */
    styleguides?: string[];

    /** {@inheritdoc LinkConfig} */
    links?: LinkConfig[];

    /** {@inheritdoc ComponentConfig} */
    components: ComponentConfig[];

    /** {@link Plugin | Plugin} names and their configurations */
    plugins?: Plugin[];

    /** {@link GithubConfig} */
    github?: GithubConfig;
}

/** @internal */
export interface ConnectPluginInstance extends ConnectPlugin {
    name: string;
}
