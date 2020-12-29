import { ConnectedBarrelComponents, ConnectedComponent, ConnectedComponentList } from "../src/commands/connect/interfaces/api";
import { LinkType } from "../src/commands/connect/interfaces/plugin";
import { defaults } from "../src/config/defaults";
import { BarrelType } from "../src/api";

export const loginRequest = {
    handle: "handle",
    password: "pass"
};

export const loginResponse = {
    _id: "1234",
    email: "bruce@wayne.com",
    username: "iambatman",
    token: "ThisIsATotallyLegitimateToken",
    status: "active",
    paymentPlan: "billionaire",
    emailNotifications: false,
    notificationLastReadTime: new Date()
};

export const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoidXNlcjoxMjMxMjMxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjIsInNjb3BlIjoid3JpdGUlMjBkZWxldGUifQ.DexGQS24IB9n_o57dPPfCtLTfBTs_m_bS2Ka73qOVAQ";
export const invalidJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid";
export const validJwtWithoutAudience = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
export const validJwtWithoutDeleteScope = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoidXNlcjoxMjMxMjMxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.p5Sr4rXPvVuNl9useetyAtYc7ZO6U73XmAhNUsFtFJs";

export const connectedComponent1: ConnectedComponent = {
    path: "src/Sample1.jsx",
    zeplinNames: ["screen1"],
    name: "Sample1",
    data: [{
        plugin: "pluginName",
        lang: "jsx",
        description: "desc",
        snippet: "snip"
    }],
    urlPaths: [{
        type: LinkType.custom,
        url: "https://example.com",
        name: "urlName"
    }]
};

export const connectedComponent2: ConnectedComponent = {
    path: "src/Sample2.jsx",
    zeplinNames: ["screen2"],
    name: "Sample2",
    data: [{
        plugin: "pluginName",
        lang: "jsx",
        description: "desc",
        snippet: "snip"
    }],
    urlPaths: [{
        type: LinkType.custom,
        url: "https://example.com",
        name: "urlName"
    }]
};

export const connectedComponents: ConnectedBarrelComponents = {
    projects: ["pid1", "pid2"],
    styleguides: ["sid1", "sid2"],
    connectedComponents: [
        connectedComponent1,
        connectedComponent2
    ]
};

export const connectedComponentList: ConnectedComponentList = {
    connectedComponents: [
        connectedComponent1,
        connectedComponent2
    ]
};

export const axiosError = {
    isAxiosError: true,
    response: {
        data: {
            title: "Error title",
            message: "Error message"
        },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {}
    },
    config: {},
    name: "AxiosError",
    message: "Error message"
};

export const generateTokenAxiosRequest = {
    params: {
        client_id: defaults.api.clientId,
        response_type: "token",
        scope: "write delete"
    },
    headers: { "Zeplin-Token": loginResponse.token },
    maxRedirects: 0
};

export const uploadParams = {
    barrelId: "pid",
    barrelType: "projects" as BarrelType
};

export const deleteParams = {
    barrelId: "pid",
    barrelType: "projects" as BarrelType
};

export const sampleComponentConfig1 = {
    path: "src/Sample1.jsx",
    zeplinNames: ["screen1"]
};

export const sampleComponentConfig2 = {
    path: "src/Sample1.jsx",
    zeplinNames: ["screen1"]
};

export const sampleConfig = {
    plugins: [] as Array<{
        /** npm package name of the plugin */
        name: string;
    }>,
    components: [sampleComponentConfig1, sampleComponentConfig2]
};

export const getProjectsResponse = {
    projects: [{
        _id: "540b91990ffebc59619fa193",
        name: "Project-Name",
        type: "android",
        description: "A project description"
    }, {
        _id: "540b6c6b2bd0742860c6b1d4",
        name: "Another-Project-Name",
        type: "web",
        description: "A project description",
        organization: {
            _id: "540b91990ffebc59619fa197",
            name: "Organization-Name"
        }
    }]
};
