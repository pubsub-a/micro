(function() {
  var pubsub = new PubSubMicro();
  var factory = function(reset) {
    if (reset === true || reset === undefined)
      pubsub = new PubSubMicro();

    return pubsub;
  };

  // if run in the context of another test suite, we make a factory known that exports our implementation
  window.registerFactory('PubSubMicro', factory);

})();
