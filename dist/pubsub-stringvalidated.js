"use strict";
var es6_promise_1 = require("es6-promise");
var string_validation_1 = require("./string_validation");
/**
 * Takes an IPubSub and wrapps it, additionally checking any channel and topic string names for validity.
 */
var PubSubValidationWrapper = (function () {
    function PubSubValidationWrapper(wrappedPubSub) {
        this.pubsub = wrappedPubSub;
        this.stringValidator = new string_validation_1.DefaultTopicChannelNameValidator();
    }
    PubSubValidationWrapper.prototype.setTopicChannelNameSettings = function (settings) {
        this.stringValidator = new string_validation_1.DefaultTopicChannelNameValidator(settings);
    };
    PubSubValidationWrapper.prototype.start = function (callback, disconnect) {
        return this.pubsub.start(callback, disconnect);
    };
    PubSubValidationWrapper.prototype.stop = function (callback) {
        return this.pubsub.stop(callback);
    };
    PubSubValidationWrapper.prototype.channel = function (name, callback) {
        var _this = this;
        if (typeof name !== 'string')
            throw new Error("Channel name must be of type string");
        if (name == "")
            throw new Error("Channel name must be non-zerolength string");
        this.stringValidator.validateChannelName(name);
        // VALIDATION PASSED...
        var wrappedCallback;
        if (callback) {
            wrappedCallback = function (chan) {
                var wrappedChannel = new ChannelValidated(name, chan, _this.stringValidator);
                callback(wrappedChannel);
            };
        }
        // TODO promise chaining
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this.pubsub.channel(name, wrappedCallback).then(function (chan) {
                var channel = new ChannelValidated(name, chan, _this.stringValidator);
                resolve(channel);
            });
            // TODO reject() case
        });
    };
    return PubSubValidationWrapper;
}());
exports.PubSubValidationWrapper = PubSubValidationWrapper;
var ChannelValidated = (function () {
    function ChannelValidated(name, wrappedChannel, stringValidator) {
        this.name = name;
        this.wrappedChannel = wrappedChannel;
        this.stringValidator = stringValidator;
    }
    ChannelValidated.prototype.setTopicChannelNameValidator = function (validator) {
        this.stringValidator = validator;
    };
    ChannelValidated.prototype.publish = function (topic, payload, callback) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string");
        this.stringValidator.validateTopicName(topic);
        return this.wrappedChannel.publish(topic, payload, callback);
    };
    ChannelValidated.prototype.subscribe = function (topic, observer, callback) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string");
        this.stringValidator.validateTopicName(topic);
        // TODO string validation
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
//# sourceMappingURL=pubsub-stringvalidated.js.map