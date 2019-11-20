const CI_ENV_KEYS = [
    "JENKINS_HOME",
    "JENKINS_URL",
    "TRAVIS",
    "CIRCLECI",
    "CI",
    "APPCENTER_BUILD_ID",
    "TEAMCITY_VERSION",
    "GO_PIPELINE_NAME",
    "bamboo_buildKey",
    "GITLAB_CI",
    "XCS",
    "TF_BUILD",
    "GITHUB_ACTION",
    "GITHUB_ACTIONS"
];

let VERBOSE = false;

const isVerbose = (): boolean => VERBOSE;

const activateVerbose = (): void => {
    VERBOSE = true;
};

const isCI = (): boolean => CI_ENV_KEYS.some(key => key in process.env);

const getAccessTokenFromEnv = (): string | undefined => process.env.ZEPLIN_ACCESS_TOKEN;

export {
    isVerbose,
    activateVerbose,
    isCI,
    getAccessTokenFromEnv
};