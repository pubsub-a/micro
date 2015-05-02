/**
The PubSub/A test suite for validation requries us to be run within the test suite harness that
comes with pubsub-interfaces project.
*/

describe('PubSub.Micro', function() {
  // each unit tests gets the SAME instance to pubsub for the local
  // instance as there is no networking - a PubSub.Micro instance is
  // "grouped" when the object reference is equal
  var pubsub;

  beforeEach(function() {
    pubsub = new PubSub.MicroPubSub ();
  });
  var getPubSubImplementation = function() {
    return pubsub;
  };

  callAllTests(getPubSubImplementation);
});