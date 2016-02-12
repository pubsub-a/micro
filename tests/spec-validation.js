/**
 *  Code required so that we can run in the spec validation test suite that comes with the pubsub-a-interface
 *  project (not to be confused with our own unit tests in the spec/ folder).
 */

var PubSubMicro = require("../dist/src/pubsub-micro");

var pubsub = new PubSubMicro.default();

var factory = function(reset) {
    if (reset === true || reset === undefined)
        pubsub = new PubSubMicro.default();
    return pubsub;
};

module.exports = {
    factory: factory,
    name: "PubSubMicro"
};
