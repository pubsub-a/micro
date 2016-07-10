
export interface IBucketHash<T> {
    add(key: string, item: T): number;
    remove(key: string, item: T): number;
    get(key: string): Array<T>;
    exists(key: string): boolean;
}

/**
 * A Hashtable that contains a flat list of entries (bucket) for a given key.
 */
export class BucketHash<T> implements IBucketHash<T> {
    private dict: Object = {};

    /**
     * To prevent collisions with reserved JavaScript propertie of Object, we prefix every key
     * with a special character.
     */
    private encodeKey(key: string) {
        // prevent using JS internal properties of Object by using a prefix
        // for all keys
        return '$' + key;
    }

    /**
     * Adds an element to the bucket addressed by key.
     * @param  {string}      key
     * @param  {T}           item
     * @return {number}      The number of items that are inside the bucket AFTER the item has been
     *                       added.
     */
    add(key: string, item: T): number {
        var dict = this.dict;
        var encodedKey = this.encodeKey(key);

        if (!dict.hasOwnProperty(encodedKey)) {
            dict[encodedKey] = [item];
            return 1;
        } else {
            dict[encodedKey].push(item);
            return dict[encodedKey].length;
        }
    }

    /**
     * Returns the bucket of a given key.
     * @param  {string}   key
     * @return {Array<T>}     The bucket or an empty Array
     */
    get(key: string): Array<T> {
        var encodedKey = this.encodeKey(key);
        return this.dict[encodedKey] || [];
    }

    /**
     * Checks if there exists a bucket at the given key - that it that at least one element exists
     * in the bucket.
     * @param  {string}  key [description]
     * @return {boolean}     [description]
     */
    exists(key: string): boolean {
        var encodedKey = this.encodeKey(key);
        return this.dict.hasOwnProperty(encodedKey);
    }

    /**
     * Clears the bucket (and thus removes all elements within it) from the Hashtable.
     * @param {string} key [description]
     */
    clear(key: string): void {
        this.remove(key);
    }

    /**
     * Removes an element from the bucket at key. Will throw an exception if the element is not
     * in the bucket. Will throw an exception if there is no bucket for this key.
     * @param  {string} key
     * @param  {T}      item
     * @return {number}      The number of items in the bucket AFTER the element has been removed.
     */
    remove(key: string, item?: T): number {
        var encodedKey = this.encodeKey(key);
        var bucket: Array<T> = this.dict[encodedKey];
        var index;

        if (!bucket) {
            throw new Error("Key does not exist");
        }

        if (!item) {
            delete this.dict[encodedKey];
            return 0;
        }

        // iterate over the available subscriptions
        index = this.removeFromArray(bucket, item)

        if (index === -1)
            throw new Error("Trying to remove non-existant element from the bucket");

        // to save memory we remove the key completely when the bucket becomes empty
        if (bucket.length === 0)
            delete this.dict[encodedKey];

        return bucket.length;
    }

    /**
     * A helper function to remove an element from an array.
     * @param {Array<any>} arr  [description]
     * @param {any}        item [description]
     */
    private removeFromArray<T>(arr: Array<T>, item: T) {
        var index = arr.indexOf(item);

        if (index >= 0)
            arr.splice(index, 1);

        return index;
    }
}
