const indentRegex = /^(?!\s*$)/gm;
const indentCount = 4;

const indent = (multiLineText: string, opts: { character: string } = { character: " " }): string =>
    multiLineText.replace(indentRegex, opts.character.repeat(indentCount));

export {
    indent
};