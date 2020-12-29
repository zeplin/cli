export interface LoginRequest {
    handle: string;
    password: string;
}

export interface LoginResponse {
    _id: string;
    email: string;
    username: string;
    emotar?: string;
    avatar?: string;
    status: string;
    paymentPlan: string;
    emailNotifications: boolean;
    notificationLastReadTime: Date;
    token: string;
}

export interface ProjectsResponse {
    projects: Array<{
        _id: string;
        name: string;
        type: string;
        description: string;
        organization?: {
            _id: string;
            name: string;
        };
    }>;
}

export interface StyleguidesResponse {
    projects: Array<{
        _id: string;
        name: string;
        type: string;
        description: string;
        organization?: {
            _id: string;
            name: string;
        };
    }>;
}

export interface Component {
    _id: string;
    name: string;
    sourceId: string;
    description: string;
    tags: string[];
}

export interface VariantValues {
    values: {
        propertyId: string;
        value: string;
    };
}

export interface VariantProperties {
    key: string;
    properties: {
        _id: string;
        name: string;
        values: string[];
    }[];
}

export interface ComponentSection {
    _id: string;
    name: string;
    description: string;
    componentSections: ComponentSection[];
    components: Component[];
    variant: VariantValues;
}

export interface ProjectResponse {
    _id: string;
    name: string;
    type: string;
    description: string;
    styleguide: string;
    componentSections: ComponentSection[];
    variant: VariantProperties[];
}

export interface StyleguideResponse {
    _id: string;
    name: string;
    type: string;
    description: string;
    parent: string;
    ancestors: string[];
    componentSections: ComponentSection[];
    variant: VariantProperties[];
}
