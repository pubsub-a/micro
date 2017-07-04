(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PubSubMicro"] = factory();
	else
		root["PubSubMicro"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	var buckethash_1 = __webpack_require__(1);
	exports.BucketHash = buckethash_1.BucketHash;
	var pubsub_micro_1 = __webpack_require__(2);
	exports.PubSubMicroUnvalidated = pubsub_micro_1.PubSubMicroUnvalidated;
	exports.PubSub = pubsub_micro_1.PubSubMicroValidated;
	var subscription_token_1 = __webpack_require__(3);
	exports.SubscriptionToken = subscription_token_1.SubscriptionToken;
	var validation_wrapper_1 = __webpack_require__(4);
	exports.PubSubValidationWrapper = validation_wrapper_1.PubSubValidationWrapper;
	var util_1 = __webpack_require__(7);
	exports.randomString = util_1.randomString;
	__export(__webpack_require__(5));
	var helper_1 = __webpack_require__(6);
	exports.invokeIfDefined = helper_1.invokeIfDefined;
	exports.safeDispose = helper_1.safeDispose;
	//# sourceMappingURL=pubsub.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * A Hashtable that contains a flat list of entries (bucket) for a given key.
	 */
	var BucketHash = (function () {
	    function BucketHash() {
	        this.dict = {};
	    }
	    /**
	     * To prevent collisions with reserved JavaScript propertie of Object, we prefix every key
	     * with a special character.
	     */
	    BucketHash.prototype.encodeKey = function (key) {
	        // prevent using JS internal properties of Object by using a prefix
	        // for all keys
	        return "%" + key;
	    };
	    BucketHash.prototype.decodeKey = function (key) {
	        return key.substr(1);
	    };
	    /**
	     * Adds an element to the bucket addressed by key.
	     * @param  {string}      key
	     * @param  {T}           item
	     * @return {number}      The number of items that are inside the bucket AFTER the item has been
	     *                       added.
	     */
	    BucketHash.prototype.add = function (key, item) {
	        var dict = this.dict;
	        var encodedKey = this.encodeKey(key);
	        if (!dict.hasOwnProperty(encodedKey)) {
	            dict[encodedKey] = [item];
	            return 1;
	        }
	        else {
	            dict[encodedKey].push(item);
	            return dict[encodedKey].length;
	        }
	    };
	    /**
	     * Returns the bucket of a given key.
	     * @param  {string}       key
	     * @return {Array<T>}     The bucket or an empty Array
	     */
	    BucketHash.prototype.get = function (key) {
	        var encodedKey = this.encodeKey(key);
	        return this.dict[encodedKey] || [];
	    };
	    /**
	     * Gets all keys in the bucket.
	     * @return {Array<string>}
	     */
	    BucketHash.prototype.keys = function () {
	        var result = [];
	        for (var _i = 0, _a = Object.keys(this.dict); _i < _a.length; _i++) {
	            var key = _a[_i];
	            if (key[0] === '%') {
	                var decodedKey = this.decodeKey(key);
	                result.push(decodedKey);
	            }
	        }
	        ;
	        return result;
	    };
	    /**
	     * Checks if there exists a bucket at the given key - that it that at least one element exists
	     * in the bucket.
	     * @param  {string}  key
	     * @return {boolean} State of existance of the key
	     */
	    BucketHash.prototype.exists = function (key) {
	        var encodedKey = this.encodeKey(key);
	        return this.dict.hasOwnProperty(encodedKey);
	    };
	    /**
	     * Clears the bucket (and thus removes all elements within it) from the Hashtable.
	     * @param {string} key
	     */
	    BucketHash.prototype.clear = function (key) {
	        this.remove(key);
	    };
	    /**
	     * Removes an element from the bucket at key. Will throw an exception if the element is not
	     * in the bucket.
	     * @param  {string} key
	     * @param  {T}      item
	     * @return {number}      The number of items in the bucket AFTER the element has been removed.
	     */
	    BucketHash.prototype.remove = function (key, item) {
	        var encodedKey = this.encodeKey(key);
	        var bucket = this.dict[encodedKey];
	        if (!bucket) {
	            if (!item) {
	                // if no item is given and there is no bucket, nothing to clear
	                return 0;
	            }
	            else {
	                // if an item is given but there is no bucket, we ran into an error - the item was
	                // removed earlier of the bucket was cleared earlier
	                throw new Error("Key '" + key + "' does not exist");
	            }
	        }
	        if (!item) {
	            delete this.dict[encodedKey];
	            return 0;
	        }
	        // iterate over the available elements
	        var index = this.removeFromArray(bucket, item);
	        if (index === -1)
	            throw new Error("Trying to remove non-existant element from the bucket");
	        // to save memory we remove the key completely when the bucket becomes empty
	        if (bucket.length === 0)
	            delete this.dict[encodedKey];
	        return bucket.length;
	    };
	    /**
	     * A helper function to remove an element from an array.
	     * @param {Array<any>} arr  [description]
	     * @param {any}        item [description]
	     */
	    BucketHash.prototype.removeFromArray = function (arr, item) {
	        var index = arr.indexOf(item);
	        if (index >= 0)
	            arr.splice(index, 1);
	        return index;
	    };
	    return BucketHash;
	}());
	exports.BucketHash = BucketHash;
	//# sourceMappingURL=buckethash.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

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
	var buckethash_1 = __webpack_require__(1);
	var subscription_token_1 = __webpack_require__(3);
	var validation_wrapper_1 = __webpack_require__(4);
	var helper_1 = __webpack_require__(6);
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
	        var _this = this;
	        this.isStopped = false;
	        this.isStarted = false;
	        this.clientId = "";
	        if (subscriptionCache === undefined)
	            this.subscriptionCache = new buckethash_1.BucketHash();
	        else
	            this.subscriptionCache = subscriptionCache;
	        this.onStart = new Promise(function (resolve, reject) {
	            _this.notifyStart = function () { return resolve(); };
	        });
	        this.onStop = new Promise(function (resolve, reject) {
	            _this.notifyStop = function (reason) { return resolve(reason); };
	        });
	    }
	    PubSubMicroUnvalidated.prototype.start = function (disconnect) {
	        this.notifyStart();
	        return Promise.resolve(this);
	    };
	    PubSubMicroUnvalidated.prototype.stop = function (reason) {
	        if (reason === void 0) { reason = "LOCAL_DISCONNECT"; }
	        this.notifyStop(reason);
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

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var SubscriptionToken = (function () {
	    function SubscriptionToken(onDispose, count) {
	        this.isDisposed = false;
	        this.disposeFn = onDispose;
	        this.count = count ? count : 0;
	    }
	    SubscriptionToken.prototype.dispose = function () {
	        if (this.isDisposed) {
	            throw new Error('Subscription is already disposed');
	        }
	        this.isDisposed = true;
	        return this.disposeFn();
	    };
	    return SubscriptionToken;
	}());
	exports.SubscriptionToken = SubscriptionToken;
	//# sourceMappingURL=subscription-token.js.map

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var string_validation_1 = __webpack_require__(5);
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

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var DefaultTopicChannelNameValidator = (function () {
	    function DefaultTopicChannelNameValidator(settings) {
	        if (!settings) {
	            settings = {
	                channelNameMaxLength: 63,
	                topicNameMaxLength: 255,
	                allowSpecialTopicSequences: false
	            };
	        }
	        this.settings = settings;
	    }
	    /**
	     * Checks if a string consists only of the characters A-z, 0-9 plus one of ": - _ /"
	     */
	    DefaultTopicChannelNameValidator.prototype.containsOnlyValidChars = function (name) {
	        var m = name.match(/([A-z0-9_:\/\-]+)/g);
	        var contains_invalid_chars = (m == null || m == undefined || m.length == 0 || m[0] !== name);
	        return !contains_invalid_chars;
	    };
	    ;
	    /**
	     * Validates a channel to be between 1 and 63 characters long and consists only of
	     * [A-Za-z0-9] plus the special characters: : _ - /
	     *
	     */
	    DefaultTopicChannelNameValidator.prototype.validateChannelName = function (name) {
	        if (name.length > this.settings.channelNameMaxLength)
	            throw new Error("Channel name must be between 1 and " + this.settings.channelNameMaxLength + " characters long");
	        if (!this.containsOnlyValidChars(name)) {
	            throw new Error("Channel name contains invalid characters");
	        }
	    };
	    /**
	     * Validates a topic name to be between 1 and topicNameMaxLength characters long and consists only
	     * of [A-z0-9] plus the special characters: : _ - /
	     *
	     * Additionally, the reserved sequences _%_ and _$_ are allowed but should only be used
	     * internally by PubSub implementations!
	     */
	    DefaultTopicChannelNameValidator.prototype.validateTopicName = function (name) {
	        if (name.length > this.settings.topicNameMaxLength)
	            throw new Error("Topic name must be between 1 and " + this.settings.topicNameMaxLength + " characters long");
	        // quick return if there is no special characters
	        if (this.containsOnlyValidChars(name))
	            return;
	        // quick return to avoid regex
	        if (!this.settings.allowSpecialTopicSequences)
	            throw new Error("Topic name contains unallowed character(s): " + name);
	        // EXCEPTION: the special sequence _$_ and _%_ are allowed
	        var repl = name;
	        repl = repl.replace(/_\$_/g, '');
	        repl = repl.replace(/_%_/g, '');
	        if (!this.containsOnlyValidChars(repl))
	            throw new Error("Topic name contains unallowed character(s): " + name);
	    };
	    return DefaultTopicChannelNameValidator;
	}());
	exports.DefaultTopicChannelNameValidator = DefaultTopicChannelNameValidator;
	//# sourceMappingURL=string-validation.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	function safeDispose(token) {
	    if (!token)
	        throw new Error("token must be defined!");
	    if (!token.isDisposed)
	        return token.dispose();
	    else
	        return Promise.resolve(undefined);
	}
	exports.safeDispose = safeDispose;
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
	//# sourceMappingURL=helper.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	function randomString(length) {
	    if (length === void 0) { length = 8; }
	    var text = '';
	    var allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	    for (var i = 0; i < length; i++)
	        text += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));
	    return text;
	}
	exports.randomString = randomString;
	//# sourceMappingURL=util.js.map

/***/ })
/******/ ])
});
;