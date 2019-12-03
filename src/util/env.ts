let VERBOSE = false;

const isVerbose = (): boolean => VERBOSE;

const activateVerbose = (): void => {
    VERBOSE = true;
};

const getAccessTokenFromEnv = (): string | undefined => process.env.ZEPLIN_ACCESS_TOKEN;

export {
    isVerbose,
    activateVerbose,
    getAccessTokenFromEnv
};