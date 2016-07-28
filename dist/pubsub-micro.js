"use strict";
var es6_promise_1 = require("es6-promise");
var buckethash_1 = require('./buckethash');
var subscription_token_1 = require('./subscription-token');
var util_1 = require('./util');
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
function validateChannelOrTopicName(name) {
    if (typeof name !== 'string')
        throw new Error("parameter must be of type string");
    if (!name || name.length > 255)
        throw new Error("parameter must be between 1 and 255 characters long");
    // TODO special characters check
}
exports.validateChannelOrTopicName = validateChannelOrTopicName;
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
    /**
     * Validates a channel to be between 1 and 255 characters long and consists only of
     * [A-Za-z0-9] plus the special characters: : _ - /
     *
     */
    PubSub.prototype.validateChannelName = function (name) {
        return validateChannelOrTopicName(name);
    };
    PubSub.prototype.channel = function (name, callback) {
        this.validateChannelName(name);
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
    function Publisher(name, cache) {
        this.name = name;
        this.cache = cache;
    }
    Publisher.prototype.publish = function (obj) {
        var subs = this.cache.get(this.name);
        for (var i = 0; i < subs.length; i++) {
            subs[i](obj);
        }
    };
    return Publisher;
}());
var Subscriber = (function () {
    function Subscriber(name, cache) {
        this.name = name;
        this.cache = cache;
    }
    Subscriber.prototype.subscribe = function (cb) {
        var _this = this;
        var number_of_subscriptions = this.cache.add(this.name, cb);
        var dispose = function (callback) {
            var remaining = _this.cache.remove(_this.name, cb);
            invokeIfDefined(callback, remaining);
            return remaining;
        };
        return new subscription_token_1.SubscriptionToken(dispose, number_of_subscriptions);
    };
    return Subscriber;
}());
var Channel = (function () {
    function Channel(name, cache) {
        this.name = name;
        this.cache = cache;
        this.name = name;
    }
    Channel.prototype.encodeTopic = function (topic) {
        if (topic.indexOf("%") !== -1) {
            throw "The percent character (%) is not allowed in topic names";
        }
        var encodedTopic = this.name + "%" + topic;
        return encodedTopic;
    };
    Channel.prototype.publish = function (topic, payload, callback) {
        var publisher = new Publisher(this.encodeTopic(topic), this.cache);
        publisher.publish(payload);
        invokeIfDefined(callback, topic, payload);
    };
    Channel.prototype.subscribe = function (topic, subscription, callback) {
        var subscriber = new Subscriber(this.encodeTopic(topic), this.cache);
        var subscriptionHandle = subscriber.subscribe(subscription);
        invokeIfDefined(callback, subscriptionHandle, topic, subscription);
        return subscriptionHandle;
    };
    Channel.prototype.once = function (topic, subscription, callback) {
        var internal_subs;
        var wrapperInnerFunc = function (payload) {
            internal_subs.dispose();
            subscription(payload);
        };
        var wrapperFunc = wrapperInnerFunc.bind(subscription);
        internal_subs = this.subscribe(this.encodeTopic(topic), wrapperFunc, callback);
        return internal_subs;
    };
    return Channel;
}());
//# sourceMappingURL=pubsub-micro.js.map