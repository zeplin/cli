import { AuthenticationContext } from "./authentication";

/** @internal */
export interface Organization {
    _id: string;
    name: string;
}

/** @internal */
export interface ZeplinComponent {
    _id: string;
    sourceId: string;
    name: string;
}

/** @internal */
export interface ZeplinResource {
    _id: string;
    name: string;
    type: "Project" | "Styleguide";
    organization?: Organization;
}

/** @internal */
export interface ResourceContext extends AuthenticationContext {
    projectId: string;
    styleguideId: string;
    componentId: string;
    resources: Record<string, ZeplinResource>;
    selectedResource: ZeplinResource;
    selectedComponents: ZeplinComponent[];
    components: ZeplinComponent[];
}
