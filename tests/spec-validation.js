(function() {
  var pubsub = new PubSubA.MicroPubSub();
  var factory = function(reset) {
    if (reset === true || reset === undefined)
      pubsub = new PubSubA.MicroPubSub();

    return pubsub;
  };

  // if run in the context of another test suite, we make a factory known that exports our implementation
  window.registerFactory('PubSubA.Micro', factory);

})();
