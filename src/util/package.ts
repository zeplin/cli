import isYarnGlobal from "is-yarn-global";
import isInstalledGlobally from "is-installed-globally";
import hasYarn from "has-yarn";

const isRunningFromYarnGlobal = (): boolean => isYarnGlobal();

const isRunningFromGlobal = (): boolean => isRunningFromYarnGlobal() || isInstalledGlobally;

const projectHasYarn = (): boolean => hasYarn();

export {
    isRunningFromYarnGlobal,
    isRunningFromGlobal,
    projectHasYarn
};