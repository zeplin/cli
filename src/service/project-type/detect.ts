import { SupportedProjectType, supportedProjectTypes } from "./project-types";
import { getPackageJson, getBowerJson } from "../../util/js/config";
import { asyncFilter } from "../../util/array";

export async function detectProjectTypes(): Promise<SupportedProjectType[]> {
    const packageJson = await getPackageJson();
    const bowerJson = await getBowerJson();

    const context = {
        packageJson,
        bowerJson
    };

    return asyncFilter(supportedProjectTypes, spt => spt.matcher(context));
}
