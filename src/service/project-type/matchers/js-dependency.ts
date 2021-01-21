import { ProjectMatcher } from ".";
import { hasDependency, JsDependencies } from "../../../util/js/dependency";

export function jsDependencyMatcherFactory(
    dependencies: string[],
    mode: "every" | "some" = "some"
): ProjectMatcher {
    return (ctx: JsDependencies): boolean => {
        const dependencyFile = ctx.packageJson || ctx.bowerJson;
        if (dependencyFile) {
            return mode === "every"
                ? dependencies.every(d => hasDependency(dependencyFile, d))
                : dependencies.some(d => hasDependency(dependencyFile, d));
        }

        return false;
    };
}
