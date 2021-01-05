import { AuthenticationContext } from "./authentication";

export interface Organization {
    _id: string;
    name: string;
}

export interface ZeplinComponent {
    _id: string;
    sourceId: string;
    name: string;
}

export interface ZeplinResource {
    _id: string;
    name: string;
    type: "Project" | "Styleguide";
    organization?: Organization;
}

export interface ResourceContext extends AuthenticationContext {
    projectId: string;
    styleguideId: string;
    componentId: string;
    resources: Record<string, ZeplinResource>;
    selectedResource: ZeplinResource;
    selectedComponents: ZeplinComponent[];
    components: ZeplinComponent[];
}
