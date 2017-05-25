"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var buckethash_1 = require("./buckethash");
var subscription_token_1 = require("./subscription-token");
var validation_wrapper_1 = require("./validation-wrapper");
var helper_1 = require("./helper");
var PubSubMicroValidated = (function (_super) {
    __extends(PubSubMicroValidated, _super);
    function PubSubMicroValidated(subscriptionCache) {
        return _super.call(this, new PubSubMicroUnvalidated(subscriptionCache)) || this;
    }
    Object.defineProperty(PubSubMicroValidated.prototype, "subscriptionCache", {
        /**
         * To allow shared/link PubSub instances (for testing)
         * expose the subscriptionCache so we can pass it to
         * other instances
         */
        get: function () {
            return this.pubsub.subscriptionCache;
        },
        enumerable: true,
        configurable: true
    });
    return PubSubMicroValidated;
}(validation_wrapper_1.PubSubValidationWrapper));
exports.PubSubMicroValidated = PubSubMicroValidated;
var PubSubMicroUnvalidated = (function () {
    function PubSubMicroUnvalidated(subscriptionCache) {
        this.isStopped = false;
        this.isStarted = false;
        this.clientId = "";
        if (subscriptionCache === undefined)
            this.subscriptionCache = new buckethash_1.BucketHash();
        else
            this.subscriptionCache = subscriptionCache;
    }
    PubSubMicroUnvalidated.prototype.start = function (disconnect) {
        return Promise.resolve(this);
    };
    PubSubMicroUnvalidated.prototype.stop = function () {
        this.isStopped = true;
        return Promise.resolve(void 0);
    };
    PubSubMicroUnvalidated.prototype.channel = function (name) {
        var channel = new Channel(name, this);
        return Promise.resolve(channel);
    };
    return PubSubMicroUnvalidated;
}());
exports.PubSubMicroUnvalidated = PubSubMicroUnvalidated;
var Publisher = (function () {
    function Publisher(encodedTopic, bucket) {
        this.encodedTopic = encodedTopic;
        this.bucket = bucket;
    }
    Publisher.prototype.publish = function (obj) {
        var subs = this.bucket.get(this.encodedTopic);
        for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
            var observer = subs_1[_i];
            try {
                observer(obj);
            }
            catch (err) {
                // we don't handle exceptions the observer functions throws,
                // it is observer functions duty to catch errors and handle them
            }
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
        var onDispose = function () {
            var remaining = _this.bucket.remove(_this.encodedTopic, observer);
            return Promise.resolve(remaining);
        };
        return new subscription_token_1.SubscriptionToken(onDispose, number_of_subscriptions);
    };
    return Subscriber;
}());
var Channel = (function () {
    function Channel(name, pubsub) {
        this.name = name;
        this.pubsub = pubsub;
    }
    Object.defineProperty(Channel.prototype, "bucket", {
        get: function () {
            return this.pubsub.subscriptionCache;
        },
        enumerable: true,
        configurable: true
    });
    ;
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
        var publisher = new Publisher(this.encodeTopic(topic), this.bucket);
        publisher.publish(payload);
        helper_1.invokeIfDefined(callback, topic, payload);
        return Promise.resolve();
    };
    Channel.prototype.subscribe = function (topic, observer) {
        if (!observer) {
            throw new Error("observer function must be given and be of type function");
        }
        var subscriber = new Subscriber(this.encodeTopic(topic), this.bucket);
        var subscription = subscriber.subscribe(observer);
        return Promise.resolve(subscription);
    };
    Channel.prototype.once = function (topic, observer) {
        var promise;
        var alreadyRun = false;
        var subscribeAndDispose = (function (payload) {
            if (alreadyRun)
                return;
            alreadyRun = true;
            promise.then(function (subs) {
                // the user may have disposed the subscription himself, so we need to check if it is still active
                helper_1.safeDispose(subs);
            });
            observer(payload);
        }).bind(observer);
        promise = this.subscribe(topic, subscribeAndDispose);
        return promise;
    };
    return Channel;
}());
//# sourceMappingURL=pubsub-micro.js.map