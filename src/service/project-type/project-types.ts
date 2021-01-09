import { jsDependencyMatcherFactory } from "./matchers/js-dependency";
import { supportedStorybookFrameworks } from "./storybook";
import { Matcher } from "./matchers";

export enum ProjectType {
    REACT = "react",
    PREACT = "preact",
    ANGULAR = "angular",
    VUE = "vue",
    HAS_STORYBOOK = "storybook",
    UNKNOWN = "unknown"
    // TODO: Add other detectable frameworks
}

export interface SupportedProjectType {
    type: ProjectType;
    matcher: Matcher;
    installPackages?: string[];
}

export const supportedProjectTypes: SupportedProjectType[] = [
    {
        type: ProjectType.REACT,
        matcher: jsDependencyMatcherFactory(["react", "react-native"]),
        installPackages: [
            "@zeplin/cli-connect-react-plugin"
        ]
    },
    {
        type: ProjectType.PREACT,
        matcher: jsDependencyMatcherFactory(["preact"]),
        installPackages: [
            "@zeplin/cli-connect-react-plugin"
        ]
    },
    {
        type: ProjectType.ANGULAR,
        matcher: jsDependencyMatcherFactory(["@angular/core"]),
        installPackages: [
            "@zeplin/cli-connect-angular-plugin"
        ]
    },
    {
        type: ProjectType.VUE,
        matcher: jsDependencyMatcherFactory(["vue", "nuxt"]),
        installPackages: [
            "zeplin-cli-connect-plugin-vue"
        ]
    },
    {
        type: ProjectType.HAS_STORYBOOK,
        matcher: jsDependencyMatcherFactory(supportedStorybookFrameworks),
        installPackages: [
            "@zeplin/cli-connect-storybook-plugin"
        ]
    }
];

export function getSupportedProjectType(projectType: string): SupportedProjectType | undefined {
    return supportedProjectTypes.find(spt => spt.type === projectType);
}
