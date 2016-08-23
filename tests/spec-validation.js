/**
 *  Code required so that we can run in the spec validation test suite that comes with the pubsub-a-interface
 *  project (not to be confused with our own unit tests in the spec/ folder).
 */

(function() {

    var PubSub;

    if (typeof window === "undefined") {
        PubSub = require("../dist/pubsub").PubSub;
    } else {
        PubSub = PubSubMicro.PubSub;
    }

    var getPubSubImplementation = function() {
        return new PubSub();
    };

    var getLinkedPubSubImplementation = function(numInstances) {
        if (!numInstances) numInstances = 2;
        var instance = new PubSub();

        var instances = [];

        while(numInstances-- > 0) {
            // PubSubMicro is object instance based, always return the same object instance
            instances.push(instance);
        }
        return instances;
    };

    var factory = {
        name: "PubSubMicro",
        getPubSubImplementation: getPubSubImplementation,
        getLinkedPubSubImplementation: getLinkedPubSubImplementation
    };

    if (typeof window === "undefined") {
        module.exports = factory;
    } else {
        registerPubSubImplementationFactory(factory);
    }

}());
