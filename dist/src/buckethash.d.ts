export interface IBucketHash<T> {
    add(key: string, item: T): number;
    remove(key: string, item: T): number;
    get(key: string): Array<T>;
    exists(key: string): boolean;
}
export declare class BucketHash<T> implements IBucketHash<T> {
    private dict;
    private encodeKey(key);
    add(key: string, item: T): number;
    get(key: string): Array<T>;
    exists(key: string): boolean;
    clear(key: string): void;
    /**
    @returns The number of items in the bucket for this key
    */
    remove(key: string, item?: T): number;
    private removeFromArray(arr, item);
}
