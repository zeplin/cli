export function sortByKeys<K extends string, V>(obj: Record<K, V>): Record<K, V> {
    return Object.keys(obj).sort().reduce((output, key) => {
        const k = key as K;
        output[k] = obj[k];
        return output;
    }, {} as Record<K, V>);
}