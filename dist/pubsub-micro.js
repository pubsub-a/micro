"use strict";
var es6_promise_1 = require("es6-promise");
var buckethash_1 = require('./buckethash');
var subscription_token_1 = require('./subscription-token');
var util_1 = require('./util');
var string_validation_1 = require("./string_validation");
function invokeIfDefined(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (func) {
        func.apply(func, args);
    }
}
exports.invokeIfDefined = invokeIfDefined;
var buckethash_2 = require("./buckethash");
exports.BucketHash = buckethash_2.BucketHash;
var string_validation_2 = require("./string_validation");
exports.validateChannelName = string_validation_2.validateChannelName;
exports.validateTopicName = string_validation_2.validateTopicName;
var PubSub = (function () {
    function PubSub() {
        this.subscriptionCache = new buckethash_1.BucketHash();
    }
    PubSub.prototype.start = function (callback, disconnect) {
        invokeIfDefined(callback, this, undefined, undefined);
        return es6_promise_1.Promise.resolve(this);
    };
    PubSub.prototype.stop = function (callback) {
        invokeIfDefined(callback);
        return es6_promise_1.Promise.resolve(void 0);
    };
    PubSub.prototype.channel = function (name, callback) {
        string_validation_1.validateChannelName(name);
        var channel = new Channel(name, this.subscriptionCache);
        invokeIfDefined(callback, channel);
        return es6_promise_1.Promise.resolve(channel);
    };
    PubSub.includeIn = function (obj, publish_name, subscribe_name) {
        return internalIncludeIn(obj, publish_name, subscribe_name);
    };
    /**
     * Helper functions that expose some internals that are reused in sister projects
     */
    PubSub.BucketHash = buckethash_1.BucketHash;
    PubSub.invokeIfDefined = invokeIfDefined;
    PubSub.SubscriptionToken = subscription_token_1.SubscriptionToken;
    PubSub.Util = util_1.default;
    return PubSub;
}());
exports.PubSub = PubSub;
var AnonymousPubSub = (function () {
    function AnonymousPubSub() {
        var _this = this;
        var pubsub = new PubSub();
        pubsub.channel('__i', function (chan) { _this.channel = chan; });
        this.subscribe = this._subscribe.bind(this);
        this.publish = this._publish.bind(this);
    }
    AnonymousPubSub.prototype._subscribe = function (fn) {
        return this.channel.subscribe('a', fn);
    };
    AnonymousPubSub.prototype._publish = function (payload) {
        return this.channel.publish('a', payload);
    };
    return AnonymousPubSub;
}());
function internalIncludeIn(obj, publishName, subscribeName) {
    if (publishName === void 0) { publishName = 'publish'; }
    if (subscribeName === void 0) { subscribeName = 'subscribe'; }
    // TODO obj must be instanceof/child of Object ?
    var pubsub = new AnonymousPubSub();
    obj[subscribeName] = pubsub.subscribe;
    obj[publishName] = pubsub.publish;
    return obj;
}
var Publisher = (function () {
    function Publisher(encodedTopic, cache) {
        this.encodedTopic = encodedTopic;
        this.cache = cache;
    }
    Publisher.prototype.publish = function (obj) {
        var subs = this.cache.get(this.encodedTopic);
        for (var i = 0; i < subs.length; i++) {
            subs[i](obj);
        }
    };
    return Publisher;
}());
var Subscriber = (function () {
    function Subscriber(encodedTopic, bucket) {
        this.encodedTopic = encodedTopic;
        this.bucket = bucket;
    }
    Subscriber.prototype.subscribe = function (observer) {
        var _this = this;
        var number_of_subscriptions = this.bucket.add(this.encodedTopic, observer);
        var dispose = function (callback) {
            var remaining = _this.bucket.remove(_this.encodedTopic, observer);
            invokeIfDefined(callback, remaining);
            return remaining;
        };
        return new subscription_token_1.SubscriptionToken(dispose, number_of_subscriptions);
    };
    return Subscriber;
}());
var Channel = (function () {
    function Channel(name, bucket) {
        this.name = name;
        this.bucket = bucket;
        this.name = name;
    }
    /**
     * We encode the channel namen and the topic into a single string to place in the BucketHash.
     * This way all channel/topic combinations will share subscriptions, independent of the current
     * instance of the Channel object.
     *
     * For example, two different Channel object instances will trigger each others subscriptions this way.
     */
    Channel.prototype.encodeTopic = function (topic) {
        var encodedTopic = this.name + "_%_" + topic;
        return encodedTopic;
    };
    Channel.prototype.publish = function (topic, payload, callback) {
        string_validation_1.validateTopicName(topic);
        var publisher = new Publisher(this.encodeTopic(topic), this.bucket);
        publisher.publish(payload);
        invokeIfDefined(callback, topic, payload);
    };
    Channel.prototype.subscribe = function (topic, observer, callback) {
        string_validation_1.validateTopicName(topic);
        var subscriber = new Subscriber(this.encodeTopic(topic), this.bucket);
        var subscription = subscriber.subscribe(observer);
        invokeIfDefined(callback, subscription, topic, observer);
        return subscription;
    };
    Channel.prototype.once = function (topic, observer, callback) {
        string_validation_1.validateTopicName(topic);
        var subscription;
        var subscribeAndDispose = (function (payload) {
            subscription.dispose();
            observer(payload);
        }).bind(observer);
        subscription = this.subscribe(this.encodeTopic(topic), subscribeAndDispose, callback);
        return subscription;
    };
    return Channel;
}());
//# sourceMappingURL=pubsub-micro.js.map