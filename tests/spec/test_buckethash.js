if (typeof window === "undefined") {
  var BucketHash = require("../../dist/buckethash").BucketHash;
  var expect = require("chai").expect;
} else {
  var BucketHash = PubSubMicro.BucketHash;
}

describe('BucketHash basic tests', function() {

  it ("should accept the first item and return 1 as the number of elements", function() {
    var hash = new BucketHash();
    var count = hash.add('key', 1);

    expect(count).to.equal(1);
  });


  it ("should remove the last element and return 0 as the number of elements", function() {
    var hash = new BucketHash();
    var item = {};
    hash.add('key', item);
    var count = hash.remove('key', item);
    expect(count).to.equal(0);
  });


  it ("should only remove a single element in a bucket with duplicates", function() {
    var hash = new BucketHash();
    var item = {};
    hash.add('key', item);
    hash.add('key', item);

    var count = hash.remove('key', item);
    expect(count).to.equal(1);
  });

  it ("should not throw an exception if we try to clear an empty bucket", function() {
    var hash = new BucketHash();
    var fn = function() {
      hash.clear('key');
    };

    expect(fn).not.to.throw();
  });

  it ("should throw an exception if the key does not exist but an item to remove is specified", function() {
    var hash = new BucketHash();
    var item = {};
    var fn = function() {
      hash.remove('key', item);
    };

    expect(fn).to.throw();
  });

  it ("throw an exception if the element is not in the bucket", function() {
    var hash = new BucketHash();
    var item = {};
    var nonexistingitem = 1;
    hash.add('key', item);
    hash.add('key', item);

    expect(function() { hash.remove('key', nonexistingitem); }).to.throw();
  });

  it ("should not have any elements for a key if it is removed", function() {
    var hash = new BucketHash();
    var item = 'foo';
    hash.add('key1', item);
    hash.add('key2', item);
    hash.add('key3', item);
    hash.remove('key1', item);
    hash.remove('key2', item);
    hash.remove('key3', item);

    var dict = hash.dict;
    // we test whether the elements are realldy freed and don't consume memory
    // using .exists() is thus not feasible at this place
    expect(dict['$key1']).to.be.undefined;
    expect(dict['$key2']).to.be.undefined;
    expect(dict['$key3']).to.be.undefined;

    expect(JSON.stringify(hash.dict)).to.equal('{}');
  });

  it ("should not have any elements for a cleared key", function() {
    var hash = new BucketHash();
    var item = function() {};
    hash.add('key', item);
    hash.add('key', item);
    hash.add('key', item);
    hash.clear('key');

    expect(hash.exists('key')).to.be.falsy;
    var str = JSON.stringify(hash.dict);
    expect(str).to.equal('{}');
  });

  it ("should be able to get all keys", function() {
    var hash = new BucketHash();
    var item = {};
    hash.add("key1", item);
    hash.add("key2", item);
    hash.add("key3", item);

    var keys = hash.keys();
    expect(keys).to.include("key1");
    expect(keys).to.include("key2");
    expect(keys).to.include("key3");

    expect(keys.length).to.equal(3);
  });

  if ("should be able to get all keys and do not include empty buckets", function() {
    var hash = new BucketHash();
    var item = {};
    hash.add("key1", item);
    hash.add("key2", item);
    hash.add("key3", item);
    hash.remove("key1", item);

    expect(keys).to.include("key2");
    expect(keys).to.include("key3");

    expect(keys.length).to.equal(2);
  });

  if ("should be able to get all keys and do not include cleared buckets", function() {
    var hash = new BucketHash();
    var item = {};
    hash.add("key1", item);
    hash.add("key1", item);
    hash.add("key2", item);
    hash.add("key3", item);
    hash.clear("key1");

    expect(keys).to.include("key2");
    expect(keys).to.include("key3");

    expect(keys.length).to.equal(2);
  });

});
