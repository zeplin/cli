import { ConnectedBarrelComponents, ConnectedComponent } from "../src/commands/connect/interfaces/api";
import { LinkType } from "../src/commands/connect/interfaces/plugin";

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

export const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoidXNlcjoxMjMxMjMxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.p5Sr4rXPvVuNl9useetyAtYc7ZO6U73XmAhNUsFtFJs";
export const invalidJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid";
export const validJwtWithoutAudience = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

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