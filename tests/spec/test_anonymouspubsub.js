
describe('Anonymous PubSub', function() {
  var hub = {};
  beforeEach(function() {
    PubSubA.MicroPubSub.includeIn(hub);
  });

  it ('should trigger a subscription and return a count', function(done) {
    var token = hub.subscribe(function(val) {
      expect(val).toBe(true);
      done();
    });

    expect(token.count).toBe(1);
    hub.publish(true);

  });

  it ('should be able to monkey-patch an existing object', function(done) {
    var myObject = {};
    PubSubA.MicroPubSub.includeIn(myObject);

    myObject.subscribe(function(val) {
      expect(val).toBe(true);
      done();
    });

    myObject.publish(true);

  });
  it ('should be able to monkey-patch an existing object with custom function names', function(done) {
    var myObject = {};
    PubSubA.MicroPubSub.includeIn(myObject, 'customPublish', 'customSubscribe');

    myObject.customSubscribe(function(val) {
      expect(val).toBe(true);
      done();
    });

    myObject.customPublish (true);

  });
  it ('should be able to maintain the this-scope in a monkey-patched object', function(done) {
    var myObject = function(){
      this.foo = 'bar';
      PubSubA.MicroPubSub.includeIn(this);
    };

    myObject.prototype.sub = function() {
      this.subscribe(function(val) {
        expect(val).toBe(true);
        done();
      });
    };

    myObject.prototype.pub = function() {
      this.publish(true);
    };

    var instance = new myObject();
    instance.sub();
    instance.pub();

  });

});