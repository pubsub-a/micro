export interface IBucketHash<T> {
    add(key: string, item: T): number;
    remove(key: string, item: T): number;
    get(key: string): Array<T>;
    exists(key: string): boolean;
}
/**
 * A Hashtable that contains a flat list of entries (bucket) for a given key.
 */
export declare class BucketHash<T> implements IBucketHash<T> {
    private dict;
    /**
     * To prevent collisions with reserved JavaScript propertie of Object, we prefix every key
     * with a special character.
     */
    private encodeKey(key);
    /**
     * Adds an element to the bucket addressed by key.
     * @param  {string}      key
     * @param  {T}           item
     * @return {number}      The number of items that are inside the bucket AFTER the item has been
     *                       added.
     */
    add(key: string, item: T): number;
    /**
     * Returns the bucket of a given key.
     * @param  {string}   key
     * @return {Array<T>}     The bucket or an empty Array
     */
    get(key: string): Array<T>;
    /**
     * Checks if there exists a bucket at the given key - that it that at least one element exists
     * in the bucket.
     * @param  {string}  key [description]
     * @return {boolean}     [description]
     */
    exists(key: string): boolean;
    /**
     * Clears the bucket (and thus removes all elements within it) from the Hashtable.
     * @param {string} key [description]
     */
    clear(key: string): void;
    /**
     * Removes an element from the bucket at key. Will throw an exception if the element is not
     * in the bucket. Will throw an exception if there is no bucket for this key.
     * @param  {string} key
     * @param  {T}      item
     * @return {number}      The number of items in the bucket AFTER the element has been removed.
     */
    remove(key: string, item?: T): number;
    /**
     * A helper function to remove an element from an array.
     * @param {Array<any>} arr  [description]
     * @param {any}        item [description]
     */
    private removeFromArray<T>(arr, item);
}
