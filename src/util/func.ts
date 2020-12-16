export async function wrapAndCall<T>(fn: Function,
    handlers: { onComplete: Function; onError: Function }): Promise<T | undefined> {
    let result;

    try {
        result = await fn();
    } catch (err) {
        await handlers.onError(err);
    }

    await handlers.onComplete();

    return result;
}
