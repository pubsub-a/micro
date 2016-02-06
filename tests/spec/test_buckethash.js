
describe('BucketHash basic tests', function() {

  it ("should accept the first item and return 1 as the number of elements", function() {
    var hash = new PubSubMicro.BucketHash();
    var count = hash.add('key', 1);

    expect(count).toBe(1);
  });


  it ("should remove the last element and return 0 as the number of elements", function() {
    var hash = new PubSubMicro.BucketHash();
    var item = {};
    hash.add('key', item);
    var count = hash.remove('key', item);
    expect(count).toBe(0);
  });


  it ("should only remove a single element in a bucket with duplicates", function() {
    var hash = new PubSubMicro.BucketHash();
    var item = {};
    hash.add('key', item);
    hash.add('key', item);

    var count = hash.remove('key', item);
    expect(count).toBe(1);
  });

  it ("should throw an exception if the key does not exist", function() {
    var hash = new PubSubMicro.BucketHash();
    var fn = function() {
      hash.remove('key');
    };

    expect(fn).toThrow();
  });

  it ("throw an exception if the element is not in the bucket", function() {
    var hash = new PubSubMicro.BucketHash();
    var item = {};
    hash.add('key', item);
    hash.add('key', item);

    expect(function() { hash.remove('key', 1) }).toThrow();
  });

  it ("should not have any elements for a key if it is removed", function() {
    var hash = new PubSubMicro.BucketHash();
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
    expect(dict['$key1']).toBeUndefined();
    expect(dict['$key2']).toBeUndefined();
    expect(dict['$key3']).toBeUndefined();

    expect(JSON.stringify(hash.dict)).toEqual('{}');
  });

  it ("should not have any elements for a cleared key", function() {
    var hash = new PubSubMicro.BucketHash();
    var item = function() {};
    hash.add('key', item);
    hash.add('key', item);
    hash.add('key', item);
    hash.clear('key');

    expect(hash.exists('key')).toBeFalsy();
    var str = JSON.stringify(hash.dict);
    expect(str).toEqual('{}');
  });

});
