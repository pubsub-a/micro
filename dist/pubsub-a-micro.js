var PubSubMicro =
/******/ (function(modules) { // webpackBootstrap
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
/***/ function(module, exports, __webpack_require__) {

	/*
	  custom JS file as TS/Webpack don't bundle to global variable correctly
	  See: https://github.com/Microsoft/TypeScript/issues/2719 for problem description
	*/

	var pubsub = __webpack_require__(1);
	module.exports = pubsub.default;



/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var buckethash_1 = __webpack_require__(2);
	var subscription_token_1 = __webpack_require__(3);
	var util_1 = __webpack_require__(4);
	function invokeIfDefined(func) {
	    var args = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        args[_i - 1] = arguments[_i];
	    }
	    if (func) {
	        func.apply(func, args);
	    }
	}
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = PubSub;
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	var BucketHash = (function () {
	    function BucketHash() {
	        this.dict = {};
	    }
	    BucketHash.prototype.encodeKey = function (key) {
	        // prevent using JS internal properties of Object by using a prefix
	        // for all keys
	        return '$' + key;
	    };
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
	    BucketHash.prototype.get = function (key) {
	        var encodedKey = this.encodeKey(key);
	        return this.dict[encodedKey] || [];
	    };
	    BucketHash.prototype.exists = function (key) {
	        var encodedKey = this.encodeKey(key);
	        return this.dict.hasOwnProperty(encodedKey);
	    };
	    BucketHash.prototype.clear = function (key) {
	        var result = this.get(key);
	        this.remove(key);
	    };
	    /**
	    @returns The number of items in the bucket for this key
	    */
	    BucketHash.prototype.remove = function (key, item) {
	        var encodedKey = this.encodeKey(key);
	        var bucket = this.dict[encodedKey];
	        var index;
	        if (!bucket) {
	            throw new Error("Key does not exist");
	        }
	        if (!item) {
	            delete this.dict[encodedKey];
	            return 0;
	        }
	        // iterate over the available subscriptions
	        index = this.removeFromArray(bucket, item);
	        if (index === -1)
	            throw new Error("Trying to remove non-existant element from the bucket");
	        // to save memory we remove the key completely
	        if (bucket.length === 0)
	            delete this.dict[encodedKey];
	        return bucket.length;
	    };
	    BucketHash.prototype.removeFromArray = function (arr, item) {
	        var index = arr.indexOf(item);
	        if (index >= 0)
	            arr.splice(index, 1);
	        return index;
	    };
	    return BucketHash;
	})();
	exports.BucketHash = BucketHash;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var SubscriptionToken = (function () {
	    function SubscriptionToken(disposeFn, count) {
	        this.isDisposed = false;
	        this.disposeFn = disposeFn;
	        this.count = count ? count : 0;
	    }
	    SubscriptionToken.prototype.dispose = function (callback) {
	        if (this.isDisposed) {
	            throw new Error('Subscription is already disposed');
	        }
	        this.isDisposed = true;
	        return this.disposeFn(callback);
	    };
	    return SubscriptionToken;
	})();
	exports.SubscriptionToken = SubscriptionToken;


/***/ },
/* 4 */
/***/ function(module, exports) {

	var Util = (function () {
	    function Util() {
	    }
	    Util.randomString = function (length) {
	        if (length === void 0) { length = 8; }
	        var text = '';
	        var allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	        for (var i = 0; i < length; i++)
	            text += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));
	        return text;
	    };
	    return Util;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Util;


/***/ }
/******/ ]);