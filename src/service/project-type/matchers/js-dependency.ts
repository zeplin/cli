import { Matcher } from ".";
import { PackageJson } from "../../../util/js/config";

function hasDependency(packageJson: PackageJson, name: string): boolean {
    return !!(packageJson.dependencies?.[name]) ||
     !!(packageJson.devDependencies?.[name]) ||
     !!(packageJson.peerDependencies?.[name]);
}

export interface JsDependencies {
    packageJson?: PackageJson | null;
    bowerJson?: PackageJson | null;
}

export function jsDependencyMatcherFactory(
    dependencies: string[],
    mode: "every" | "some" = "some"
): Matcher {
    return {
        match: (ctx: JsDependencies): boolean => {
            const dependencyFile = ctx.packageJson || ctx.bowerJson;
            if (dependencyFile) {
                return mode === "every"
                    ? dependencies.every(d => hasDependency(dependencyFile, d))
                    : dependencies.some(d => hasDependency(dependencyFile, d));
            }

            return false;
        }
    };
}
