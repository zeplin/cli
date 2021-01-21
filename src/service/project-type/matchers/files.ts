import { Matcher } from ".";
import { pathExists } from "../../../util/file";

export function fileMatcherFactory(
    files: string[],
    mode: "every" | "some" = "some"
): Matcher {
    return {
        match: async (): Promise<boolean> => {
            const results = await Promise.all(files.map(f => pathExists(f)));

            return mode === "every"
                ? results.every(r => r)
                : results.some(r => r);
        }
    };
}
