var factory = function() {
  return new PubSub.MicroPubSub();
};

// if run in the context of another test suite, we make a factory known that exports our implementation
window.registerFactory('PubSub.Micro', factory);
