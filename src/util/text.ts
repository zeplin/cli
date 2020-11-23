import { isRunningFromYarnGlobal, isRunningFromGlobal, projectHasYarn } from "./package";

const indentRegex = /^(?!\s*$)/gm;
const indentCount = 4;

const indent = (multiLineText: string, opts: { character: string } = { character: " " }): string =>
    multiLineText.replace(indentRegex, opts.character.repeat(indentCount));

const getInstallCommand = (packageName: string): string => {
    if (isRunningFromYarnGlobal()) {
        return `yarn global add ${packageName}`;
    } else if (isRunningFromGlobal()) {
        return `npm install -g ${packageName}`;
    } else if (projectHasYarn()) {
        return `yarn add ${packageName}`;
    }

    return `npm install ${packageName}`;
};

export {
    indent,
    getInstallCommand
};