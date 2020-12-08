import { isCI as libIsCI } from "ci-info";
let VERBOSE = false;
let CI = false;

const isVerbose = (): boolean => VERBOSE;

const activateVerbose = (): void => {
    VERBOSE = true;
};

const getAccessTokenFromEnv = (): string | undefined => process.env.ZEPLIN_ACCESS_TOKEN;

const isCI = (): boolean => CI || libIsCI;

const activateCI = (): void => {
    CI = true;
};

export {
    isVerbose,
    activateVerbose,
    getAccessTokenFromEnv,
    isCI,
    activateCI
};