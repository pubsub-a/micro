var BucketHash = (function () {
    function BucketHash() {
        this.dict = {};
    }
    BucketHash.prototype.encodeKey = function (key) {
        // prevent using JS internal properties of Object by using a prefix
        // for all keys
        return '$' + key;
    };
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
    BucketHash.prototype.get = function (key) {
        var encodedKey = this.encodeKey(key);
        return this.dict[encodedKey] || [];
    };
    BucketHash.prototype.exists = function (key) {
        var encodedKey = this.encodeKey(key);
        return this.dict.hasOwnProperty(encodedKey);
    };
    BucketHash.prototype.clear = function (key) {
        var result = this.get(key);
        this.remove(key);
    };
    /**
    @returns The number of items in the bucket for this key
    */
    BucketHash.prototype.remove = function (key, item) {
        var encodedKey = this.encodeKey(key);
        var bucket = this.dict[encodedKey];
        var index;
        if (!bucket) {
            throw new Error("Key does not exist");
        }
        if (!item) {
            delete this.dict[encodedKey];
            return 0;
        }
        // iterate over the available subscriptions
        index = this.removeFromArray(bucket, item);
        if (index === -1)
            throw new Error("Trying to remove non-existant element from the bucket");
        // to save memory we remove the key completely
        if (bucket.length === 0)
            delete this.dict[encodedKey];
        return bucket.length;
    };
    BucketHash.prototype.removeFromArray = function (arr, item) {
        var index = arr.indexOf(item);
        if (index >= 0)
            arr.splice(index, 1);
        return index;
    };
    return BucketHash;
})();
exports.BucketHash = BucketHash;
