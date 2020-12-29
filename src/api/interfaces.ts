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
