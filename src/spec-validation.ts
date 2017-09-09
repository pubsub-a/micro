import { PubSub } from "./pubsub";

/**
 *  Code required so that we can run in the spec validation test suite that comes with the pubsub-a-interface
 *  project (not to be confused with our own unit tests in the spec/ folder).
 */

const getPubSubImplementation = function () {
    return new PubSub();
};

const getLinkedPubSubImplementation = function (numInstances: number) {
    if (!numInstances)
        numInstances = 2;

    const instance = new PubSub();
    const sharedSubscriptionCache = instance.subscriptionCache;

    const instances: Array<any> = [];

    while (numInstances-- > 0) {
       instances.push(new PubSub(sharedSubscriptionCache));
    }

    return instances;
};

const name = "PubSubMicro";

export {
    getPubSubImplementation,
    getLinkedPubSubImplementation,
    name,
}