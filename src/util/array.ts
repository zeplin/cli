type predicate<T, U> = (value: T, index: number, array: T[]) => U;

const asyncFilter = async <T, U>(arr: Array<T>, predicate: predicate<T, U>): Promise<T[]> => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
};

export {
    asyncFilter
};
