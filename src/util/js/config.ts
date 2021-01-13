import * as fileUtil from "../file";

export interface PackageJson {
    [key: string]: object;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
    scripts: Record<string, string>;
}

export async function getPackageJson(): Promise<PackageJson | null> {
    try {
        const packageJson = await fileUtil.readJsonFile("./package.json");

        return packageJson as PackageJson;
    } catch (e) {
        return null;
    }
}

export async function getBowerJson(): Promise<PackageJson | null> {
    try {
        const bowerJson = await fileUtil.readJsonFile("./bower.json");

        return bowerJson as PackageJson;
    } catch (e) {
        return null;
    }
}

export async function writePackageJson(packageJson: PackageJson): Promise<void> {
    await fileUtil.writeJsonIntoFile("./package.json", packageJson);
}
