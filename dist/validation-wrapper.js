"use strict";
var es6_promise_1 = require("es6-promise");
var string_validation_1 = require("./string-validation");
var helper_1 = require("./helper");
/**
 * Takes an IPubSub and wrapps it, additionally checking
 * - any channel and topic string names for validity
 * - the correct stop/start behaviour and throws exception if used after stopped
 * - makes sure only plain objects are published and optionally checks the message payload size.
 */
var PubSubValidationWrapper = (function () {
    function PubSubValidationWrapper(wrappedPubSub) {
        this.enablePlainObjectCheck = true;
        this.isStopped = false;
        this.pubsub = wrappedPubSub;
        this.stringValidator = new string_validation_1.DefaultTopicChannelNameValidator();
    }
    PubSubValidationWrapper.prototype.setTopicChannelNameSettings = function (settings) {
        this.stringValidator = new string_validation_1.DefaultTopicChannelNameValidator(settings);
    };
    PubSubValidationWrapper.prototype.start = function (callback, onStopByExternal) {
        if (this.isStopped) {
            var err = "Already stopped, can't restart. You need to create a new instance";
            helper_1.invokeIfDefined(callback, this, err);
            return es6_promise_1.Promise.reject("Already stopped, can't restart. You need to create a new instance");
        }
        return this.pubsub.start(callback, onStopByExternal);
    };
    PubSubValidationWrapper.prototype.stop = function (callback) {
        this.isStopped = true;
        return this.pubsub.stop(callback);
    };
    PubSubValidationWrapper.prototype.channel = function (name, callback) {
        var _this = this;
        if (this.isStopped) {
            var err = "Instance is stopped";
            return es6_promise_1.Promise.reject(new Error(err));
        }
        if (typeof name !== 'string')
            throw new Error("Channel name must be of type string");
        if (name == "")
            throw new Error("Channel name must be non-zerolength string");
        this.stringValidator.validateChannelName(name);
        // VALIDATION PASSED...
        var wrappedCallback;
        if (callback) {
            wrappedCallback = function (chan) {
                var wrappedChannel = new ChannelValidated(name, chan, _this);
                callback(wrappedChannel);
            };
        }
        // TODO promise chaining
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this.pubsub.channel(name, wrappedCallback).then(function (chan) {
                var channel = new ChannelValidated(name, chan, _this);
                resolve(channel);
            });
            // TODO reject() case
        });
    };
    return PubSubValidationWrapper;
}());
exports.PubSubValidationWrapper = PubSubValidationWrapper;
var ChannelValidated = (function () {
    function ChannelValidated(name, wrappedChannel, pubsub) {
        this.name = name;
        this.wrappedChannel = wrappedChannel;
        this.pubsub = pubsub;
        this.enablePlainObjectCheck = pubsub.enablePlainObjectCheck;
    }
    Object.defineProperty(ChannelValidated.prototype, "stringValidator", {
        get: function () {
            return this.pubsub.stringValidator;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * If the users passes in an object, it must be a plain object. Strings, numbers, array etc. are ok.
     */
    ChannelValidated.prototype.objectIsPlainObject = function (obj) {
        // TODO recursive checking, all corner cases etc.
        // Use this poor-mans approach for now
        if (typeof obj == 'object' && obj.constructor != Object) {
            return false;
        }
        else {
            return true;
        }
    };
    ChannelValidated.prototype.publish = function (topic, payload, callback) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string, was: " + topic);
        if (this.enablePlainObjectCheck && !this.objectIsPlainObject(payload)) {
            var err = new Error("only plain objects are allowed to be published");
            throw err;
        }
        if (this.pubsub.isStopped) {
            var err = new Error("pubsub has stopped");
            helper_1.invokeIfDefined(callback, err);
            return es6_promise_1.Promise.reject(err);
        }
        this.stringValidator.validateTopicName(topic);
        return this.wrappedChannel.publish(topic, payload, callback);
    };
    ChannelValidated.prototype.subscribe = function (topic, observer, callback) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string, was: " + topic);
        this.stringValidator.validateTopicName(topic);
        if (this.pubsub.isStopped) {
            var err = new Error("pubsub has stoped");
            helper_1.invokeIfDefined(callback, undefined, undefined, err);
            return es6_promise_1.Promise.reject(err);
        }
        return this.wrappedChannel.subscribe(topic, observer, callback);
    };
    ChannelValidated.prototype.once = function (topic, observer, callback) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string");
        this.stringValidator.validateTopicName(topic);
        return this.wrappedChannel.once(topic, observer, callback);
    };
    return ChannelValidated;
}());
//# sourceMappingURL=validation-wrapper.js.map