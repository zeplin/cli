export interface Matcher {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    match: (ctx: any) => boolean | Promise<boolean>;
}
