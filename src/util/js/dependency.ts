import { PackageJson } from "./config";

export interface JsDependencies {
    packageJson?: PackageJson | null;
    bowerJson?: PackageJson | null;
}

export function getDependencyVersion(packageJson: PackageJson, name: string): string | undefined {
    return packageJson.dependencies?.[name] ||
        packageJson.devDependencies?.[name] ||
        packageJson.peerDependencies?.[name];
}

export function hasDependency(packageJson: PackageJson, name: string): boolean {
    return !!getDependencyVersion(packageJson, name);
}