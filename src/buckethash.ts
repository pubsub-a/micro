
export interface IBucketHash<T> {
    add(key: string, item: T): number;
    remove(key: string, item: T): number;
    get(key: string): Array<T>;
    exists(key: string): boolean;
}

export class BucketHash<T> implements IBucketHash<T> {
    private dict: Object = {};

    private encodeKey(key: string) {
        // prevent using JS internal properties of Object by using a prefix
        // for all keys
        return '$' + key;
    }

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

    get(key: string): Array<T> {
        var encodedKey = this.encodeKey(key);
        return this.dict[encodedKey] || [];
    }

    exists(key: string): boolean {
        var encodedKey = this.encodeKey(key);
        return this.dict.hasOwnProperty(encodedKey);
    }

    clear(key: string) {
        var result = this.get(key);
        this.remove(key);
    }

    /**
    @returns The number of items in the bucket for this key
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

        // to save memory we remove the key completely
        if (bucket.length === 0)
            delete this.dict[encodedKey];

        return bucket.length;
    }

    private removeFromArray(arr: Array<any>, item: any) {
        var index = arr.indexOf(item);

        if (index >= 0)
            arr.splice(index, 1);

        return index;
    }
}
