/**
 *  Code required so that we can run in the spec validation test suite that comes with the pubsub-a-interface
 *  project (not to be confused with our own unit tests in the spec/ folder).
 */

(function() {

    var PubSub;

    if (typeof window === "undefined") {
        PubSub = require("../dist/pubsub-micro").PubSub;
    } else {
        PubSub = PubSubMicro.PubSub;
    }

    var factory = function(reset) {
        if (reset === true || reset === undefined)
            pubsub = new PubSub();
        return pubsub;
    };

    if (typeof window === "undefined") {
        module.exports = {
            factory: factory,
            name: "PubSubMicro"
        };
    } else {
        registerPubSubImplementationFactory({
            factory: factory,
            name: "PubSubMicro"
        });
    }

}());
