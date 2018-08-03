/**
 * A Hashtable that contains a flat list of entries (bucket) for a given key.
 */
export class BucketHash<T> {
    private dict = new Map<string, T[]>()

    /**
     * Adds an element to the bucket addressed by key.
     * @param  {string}      key
     * @param  {T}           item
     * @return {number}      The number of items that are inside the bucket AFTER the item has been
     *                       added.
     */
    add(key: string, item: T): number {
        const dict = this.dict;
        if (!dict.has(key)) {
            dict.set(key, [item]);
            return 1;
        } else {
            const arr = dict.get(key);
            arr!.push(item);
            return arr!.length;
        }
    }

    /**
     * Returns the bucket of a given key.
     * @param  {string}       key
     * @return {Array<T>}     The bucket or an empty Array
     */
    get(key: string): Array<T> {
        if (this.dict.has(key)) {
            return this.dict.get(key)!
        } else {
            return [];
        }
    }

    /**
     * Gets all keys in the bucket.
     */
    keys(): IterableIterator<string>  {
        return this.dict.keys();
    }

    /**
     * Checks if there exists a bucket at the given key - that it that at least one element exists
     * in the bucket.
     * @param  {string}  key
     * @return {boolean} State of existance of the key
     */
    exists(key: string): boolean {
        return this.dict.has(key);
    }

    /**
     * Clears the bucket (and thus removes all elements within it) from the Hashtable.
     * @param {string} key
     */
    clear(key: string): void {
        this.remove(key);
    }

    /**
     * Removes an element from the bucket at key. Will throw an exception if the element is not
     * in the bucket.
     * @param  {string} key
     * @param  {T}      item
     * @return {number}      The number of items in the bucket AFTER the element has been removed.
     */
    remove(key: string, item?: T): number {
        const bucket: Array<T> = this.dict.get(key)!;

        if (!bucket) {
            if (!item) {
                // if no item is given and there is no bucket, nothing to clear
                return 0;
            } else {
                // if an item is given but there is no bucket, we ran into an error - the item was
                // removed earlier of the bucket was cleared earlier
                throw new Error(`Key '${key}' does not exist`);
           }
        }

        if (!item) {
            this.dict.delete(key);
            return 0;
        }

        // iterate over the available elements
        let index = this.removeFromArray(bucket, item)

        if (index === -1)
            throw new Error("Trying to remove non-existant element from the bucket");

        // to save memory we remove the key completely when the bucket becomes empty
        if (bucket.length === 0)
            this.dict.delete(key);

        return bucket.length;
    }

    /**
     * A helper function to remove an element from an array.
     */
    private removeFromArray<T>(arr: Array<T>, item: T) {
        const index = arr.indexOf(item);

        if (index >= 0)
            arr.splice(index, 1);

        return index;
    }
}
