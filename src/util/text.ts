import { isRunningFromYarnGlobal, isRunningFromGlobal, projectHasYarn } from "./package";

const indentRegex = /^(?!\s*$)/gm;
const indentCount = 4;
const indentText = " ".repeat(indentCount);

const indent = (multiLineText: string, prefix = indentText): string =>
    multiLineText.replace(indentRegex, prefix);

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

type Replacer = (_key: string, value: object | null) => object | null | undefined;
const getCircularReplacer = (): Replacer => {
    const seen = new WeakSet();
    return (_key: string, value: object | null): object | null | undefined => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

const stringify = (json: unknown): string => JSON.stringify(json, getCircularReplacer());

export {
    indent,
    getInstallCommand,
    stringify
};
