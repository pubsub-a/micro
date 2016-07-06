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
var buckethash_2 = require("./buckethash");
exports.BucketHash = buckethash_2.BucketHash;
var PubSub = (function () {
    function PubSub() {
        this.subscriptionCache = new buckethash_1.BucketHash();
    }
    PubSub.prototype.start = function (callback) {
        invokeIfDefined(callback, this, undefined, undefined);
    };
    PubSub.prototype.stop = function (callback) {
        invokeIfDefined(callback);
    };
    PubSub.prototype.channel = function (name, callback) {
        var channel = new Channel(name, this.subscriptionCache);
        if (callback)
            callback(channel);
        return channel;
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
})();
exports.PubSub = PubSub;
var AnonymousPubSub = (function () {
    function AnonymousPubSub() {
        var pubsub = new PubSub();
        this.channel = pubsub.channel('__i', undefined);
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
})();
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
})();
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
})();
var Channel = (function () {
    function Channel(name, cache) {
        this.name = name;
        this.cache = cache;
        this.name = name;
    }
    Channel.prototype.publish = function (topic, payload, callback) {
        var publisher = new Publisher(topic, this.cache);
        publisher.publish(payload);
        invokeIfDefined(callback, topic, payload);
    };
    Channel.prototype.subscribe = function (topic, subscription, callback) {
        var subscriber = new Subscriber(topic, this.cache);
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
        internal_subs = this.subscribe(topic, wrapperFunc, callback);
        return internal_subs;
    };
    return Channel;
})();
//# sourceMappingURL=pubsub-micro.js.map