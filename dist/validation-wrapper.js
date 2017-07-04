"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var string_validation_1 = require("./string-validation");
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
        this.isStarted = false;
        this.pubsub = wrappedPubSub;
        this.stringValidator = new string_validation_1.DefaultTopicChannelNameValidator();
    }
    Object.defineProperty(PubSubValidationWrapper.prototype, "onStart", {
        get: function () {
            return this.pubsub.onStart;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PubSubValidationWrapper.prototype, "onStop", {
        get: function () {
            return this.pubsub.onStop;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PubSubValidationWrapper.prototype, "clientId", {
        get: function () {
            return this.pubsub.clientId;
        },
        enumerable: true,
        configurable: true
    });
    PubSubValidationWrapper.prototype.setTopicChannelNameSettings = function (settings) {
        this.stringValidator = new string_validation_1.DefaultTopicChannelNameValidator(settings);
    };
    PubSubValidationWrapper.prototype.start = function (onStopByExternal) {
        if (this.isStopped) {
            var err = "Already stopped, can't restart. You need to create a new instance";
            return Promise.reject(err);
        }
        if (this.isStarted == true) {
            var err = "Already started, can't start a second time.";
            throw new Error(err);
        }
        else {
            this.isStarted = true;
        }
        return this.pubsub.start(onStopByExternal);
    };
    PubSubValidationWrapper.prototype.stop = function (reason) {
        if (reason === void 0) { reason = "LOCAL_DISCONNECT"; }
        this.isStopped = true;
        return this.pubsub.stop(reason);
    };
    PubSubValidationWrapper.prototype.channel = function (name) {
        var _this = this;
        if (this.isStopped) {
            var err = "Instance is stopped";
            return Promise.reject(new Error(err));
        }
        if (typeof name !== 'string')
            throw new Error("Channel name must be of type string");
        if (name == "")
            throw new Error("Channel name must be non-zerolength string");
        this.stringValidator.validateChannelName(name);
        // VALIDATION PASSED...
        return this.pubsub.channel(name).then(function (chan) {
            return new ChannelValidated(name, chan, _this);
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
    ChannelValidated.prototype.publish = function (topic, payload) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string, was: " + topic);
        if (this.enablePlainObjectCheck && !this.objectIsPlainObject(payload)) {
            var err = new Error("only plain objects are allowed to be published");
            throw err;
        }
        if (this.pubsub.isStopped) {
            var err = new Error("publish after pubsub instance has stopped, encountered when publishing on topic: " + topic);
            return Promise.reject(err);
        }
        this.stringValidator.validateTopicName(topic);
        return this.wrappedChannel.publish(topic, payload);
    };
    ChannelValidated.prototype.subscribe = function (topic, observer) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string, was: " + topic);
        this.stringValidator.validateTopicName(topic);
        if (this.pubsub.isStopped) {
            var err = new Error("subscribe after pubsub instance has stopped, topic was: " + topic);
            return Promise.reject(err);
        }
        return this.wrappedChannel.subscribe(topic, observer);
    };
    ChannelValidated.prototype.once = function (topic, observer) {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string");
        this.stringValidator.validateTopicName(topic);
        return this.wrappedChannel.once(topic, observer);
    };
    return ChannelValidated;
}());
//# sourceMappingURL=validation-wrapper.js.map