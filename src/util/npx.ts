// Hacky way to remove NPX related $PATH item if CLI is invoked from NPX
// This is required to enable spawned CLI process to require
// the installed packages during `connect initialization/add-components`
export function removeNpxFromPath(path = ""): string {
    return path.split(":").filter(p => p.indexOf("_npx") === -1).join(":");
}
