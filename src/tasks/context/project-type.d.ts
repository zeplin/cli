import { SupportedProjectType } from "../../service/project-type/project-types";

export interface ProjectTypeContext {
    cliOptions: {
        type?: string[];
    };
    projectTypes: SupportedProjectType[];
}
