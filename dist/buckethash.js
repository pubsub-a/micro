"use strict";
/**
 * A Hashtable that contains a flat list of entries (bucket) for a given key.
 */
var BucketHash = (function () {
    function BucketHash() {
        this.dict = {};
    }
    /**
     * To prevent collisions with reserved JavaScript propertie of Object, we prefix every key
     * with a special character.
     */
    BucketHash.prototype.encodeKey = function (key) {
        // prevent using JS internal properties of Object by using a prefix
        // for all keys
        return "%" + key;
    };
    BucketHash.prototype.decodeKey = function (key) {
        return key.substr(1);
    };
    /**
     * Adds an element to the bucket addressed by key.
     * @param  {string}      key
     * @param  {T}           item
     * @return {number}      The number of items that are inside the bucket AFTER the item has been
     *                       added.
     */
    BucketHash.prototype.add = function (key, item) {
        var dict = this.dict;
        var encodedKey = this.encodeKey(key);
        if (!dict.hasOwnProperty(encodedKey)) {
            dict[encodedKey] = [item];
            return 1;
        }
        else {
            dict[encodedKey].push(item);
            return dict[encodedKey].length;
        }
    };
    /**
     * Returns the bucket of a given key.
     * @param  {string}       key
     * @return {Array<T>}     The bucket or an empty Array
     */
    BucketHash.prototype.get = function (key) {
        var encodedKey = this.encodeKey(key);
        return this.dict[encodedKey] || [];
    };
    /**
     * Gets all keys in the bucket.
     * @return {Array<string>}
     */
    BucketHash.prototype.keys = function () {
        var result = [];
        for (var _i = 0, _a = Object.keys(this.dict); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key[0] === '%') {
                var decodedKey = this.decodeKey(key);
                result.push(decodedKey);
            }
        }
        ;
        return result;
    };
    /**
     * Checks if there exists a bucket at the given key - that it that at least one element exists
     * in the bucket.
     * @param  {string}  key
     * @return {boolean} State of existance of the key
     */
    BucketHash.prototype.exists = function (key) {
        var encodedKey = this.encodeKey(key);
        return this.dict.hasOwnProperty(encodedKey);
    };
    /**
     * Clears the bucket (and thus removes all elements within it) from the Hashtable.
     * @param {string} key
     */
    BucketHash.prototype.clear = function (key) {
        this.remove(key);
    };
    /**
     * Removes an element from the bucket at key. Will throw an exception if the element is not
     * in the bucket.
     * @param  {string} key
     * @param  {T}      item
     * @return {number}      The number of items in the bucket AFTER the element has been removed.
     */
    BucketHash.prototype.remove = function (key, item) {
        var encodedKey = this.encodeKey(key);
        var bucket = this.dict[encodedKey];
        if (!bucket) {
            if (!item) {
                // if no item is given and there is no bucket, nothing to clear
                return 0;
            }
            else {
                // if an item is given but there is no bucket, we ran into an error - the item was
                // removed earlier of the bucket was cleared earlier
                throw new Error("Key '" + key + "' does not exist");
            }
        }
        if (!item) {
            delete this.dict[encodedKey];
            return 0;
        }
        // iterate over the available elements
        var index = this.removeFromArray(bucket, item);
        if (index === -1)
            throw new Error("Trying to remove non-existant element from the bucket");
        // to save memory we remove the key completely when the bucket becomes empty
        if (bucket.length === 0)
            delete this.dict[encodedKey];
        return bucket.length;
    };
    /**
     * A helper function to remove an element from an array.
     * @param {Array<any>} arr  [description]
     * @param {any}        item [description]
     */
    BucketHash.prototype.removeFromArray = function (arr, item) {
        var index = arr.indexOf(item);
        if (index >= 0)
            arr.splice(index, 1);
        return index;
    };
    return BucketHash;
}());
exports.BucketHash = BucketHash;
//# sourceMappingURL=buckethash.js.map