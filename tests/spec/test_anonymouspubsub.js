
describe('Anonymous PubSub', function() {
  var hub = {};
  beforeEach(function() {
    PubSubA.includeIn(hub);
  });

  it ('should trigger a subscription and return a count', function(done) {
    var token = hub.subscribe(function(val) {
      expect(val).toBe(true);
      done();
    });

    expect(token.count).toBe(1);
    hub.publish(true);

  });

  it ('should be able to monkey-patch an existing objectd', function(done) {
    var myObject = {};
    PubSubA.includeIn(myObject);

    myObject.subscribe(function(val) {
      expect(val).toBe(true);
      done();
    });

    myObject.publish(true);

  });
  it ('should be able to monkey-patch an existing object with custom function names', function(done) {
    var myObject = {};
    PubSubA.includeIn(myObject, 'customPublish', 'customSubscribe');

    myObject.customSubscribe(function(val) {
      expect(val).toBe(true);
      done();
    });

    myObject.customPublish (true);

  });

});