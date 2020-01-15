type FunctionReturnsSameType = <T>(object: T) => T;

declare module "mask-json" {
    function maskJson(
        collection: Array<string>,
        opts?: { ignoreCase: boolean; replacement: string }
    ): FunctionReturnsSameType;

    export = maskJson;
}