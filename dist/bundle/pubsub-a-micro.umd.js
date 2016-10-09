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
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	var buckethash_1 = __webpack_require__(1);
	exports.BucketHash = buckethash_1.BucketHash;
	var pubsub_micro_1 = __webpack_require__(2);
	exports.PubSubMicroUnvalidated = pubsub_micro_1.PubSubMicroUnvalidated;
	exports.PubSub = pubsub_micro_1.PubSubMicroValidated;
	var subscription_token_1 = __webpack_require__(6);
	exports.SubscriptionToken = subscription_token_1.SubscriptionToken;
	var validation_wrapper_1 = __webpack_require__(7);
	exports.PubSubValidationWrapper = validation_wrapper_1.PubSubValidationWrapper;
	__export(__webpack_require__(8));
	var helper_1 = __webpack_require__(9);
	exports.invokeIfDefined = helper_1.invokeIfDefined;
	exports.safeDispose = helper_1.safeDispose;
	//# sourceMappingURL=pubsub.js.map

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
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
	        return '%' + key;
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
	     * @param  {string}   key
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
	     * in the bucket. Will throw an exception if there is no bucket for this key.
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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var es6_promise_1 = __webpack_require__(3);
	var buckethash_1 = __webpack_require__(1);
	var subscription_token_1 = __webpack_require__(6);
	var validation_wrapper_1 = __webpack_require__(7);
	var helper_1 = __webpack_require__(9);
	var PubSubMicroValidated = (function (_super) {
	    __extends(PubSubMicroValidated, _super);
	    function PubSubMicroValidated() {
	        _super.call(this, new PubSubMicroUnvalidated());
	    }
	    return PubSubMicroValidated;
	}(validation_wrapper_1.PubSubValidationWrapper));
	exports.PubSubMicroValidated = PubSubMicroValidated;
	var PubSubMicroUnvalidated = (function () {
	    function PubSubMicroUnvalidated() {
	        this.isStopped = false;
	        this.subscriptionCache = new buckethash_1.BucketHash();
	    }
	    PubSubMicroUnvalidated.prototype.start = function (callback, disconnect) {
	        helper_1.invokeIfDefined(callback, this, undefined, undefined);
	        return es6_promise_1.Promise.resolve(this);
	    };
	    PubSubMicroUnvalidated.prototype.stop = function (callback) {
	        this.isStopped = true;
	        helper_1.invokeIfDefined(callback);
	        return es6_promise_1.Promise.resolve(void 0);
	    };
	    PubSubMicroUnvalidated.prototype.channel = function (name, callback) {
	        var channel = new Channel(name, this);
	        helper_1.invokeIfDefined(callback, channel);
	        return es6_promise_1.Promise.resolve(channel);
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
	        var onDispose = function (callback) {
	            var remaining = _this.bucket.remove(_this.encodedTopic, observer);
	            helper_1.invokeIfDefined(callback, remaining);
	            return es6_promise_1.Promise.resolve(remaining);
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
	        return es6_promise_1.Promise.resolve();
	    };
	    Channel.prototype.subscribe = function (topic, observer, callback) {
	        if (!observer) {
	            throw new Error("observer function must be given and be of type function");
	        }
	        var subscriber = new Subscriber(this.encodeTopic(topic), this.bucket);
	        var subscription = subscriber.subscribe(observer);
	        helper_1.invokeIfDefined(callback, subscription, topic, observer);
	        return es6_promise_1.Promise.resolve(subscription);
	    };
	    Channel.prototype.once = function (topic, observer, callback) {
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
	        promise = this.subscribe(topic, subscribeAndDispose, callback);
	        return promise;
	    };
	    return Channel;
	}());
	//# sourceMappingURL=pubsub-micro.js.map

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var require;/* WEBPACK VAR INJECTION */(function(process, global) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   3.3.1
	 */

	(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    (global.ES6Promise = factory());
	}(this, (function () { 'use strict';

	function objectOrFunction(x) {
	  return typeof x === 'function' || typeof x === 'object' && x !== null;
	}

	function isFunction(x) {
	  return typeof x === 'function';
	}

	var _isArray = undefined;
	if (!Array.isArray) {
	  _isArray = function (x) {
	    return Object.prototype.toString.call(x) === '[object Array]';
	  };
	} else {
	  _isArray = Array.isArray;
	}

	var isArray = _isArray;

	var len = 0;
	var vertxNext = undefined;
	var customSchedulerFn = undefined;

	var asap = function asap(callback, arg) {
	  queue[len] = callback;
	  queue[len + 1] = arg;
	  len += 2;
	  if (len === 2) {
	    // If len is 2, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    if (customSchedulerFn) {
	      customSchedulerFn(flush);
	    } else {
	      scheduleFlush();
	    }
	  }
	};

	function setScheduler(scheduleFn) {
	  customSchedulerFn = scheduleFn;
	}

	function setAsap(asapFn) {
	  asap = asapFn;
	}

	var browserWindow = typeof window !== 'undefined' ? window : undefined;
	var browserGlobal = browserWindow || {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

	// test for web worker but not in IE10
	var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

	// node
	function useNextTick() {
	  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	  // see https://github.com/cujojs/when/issues/410 for details
	  return function () {
	    return process.nextTick(flush);
	  };
	}

	// vertx
	function useVertxTimer() {
	  return function () {
	    vertxNext(flush);
	  };
	}

	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });

	  return function () {
	    node.data = iterations = ++iterations % 2;
	  };
	}

	// web worker
	function useMessageChannel() {
	  var channel = new MessageChannel();
	  channel.port1.onmessage = flush;
	  return function () {
	    return channel.port2.postMessage(0);
	  };
	}

	function useSetTimeout() {
	  // Store setTimeout reference so es6-promise will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var globalSetTimeout = setTimeout;
	  return function () {
	    return globalSetTimeout(flush, 1);
	  };
	}

	var queue = new Array(1000);
	function flush() {
	  for (var i = 0; i < len; i += 2) {
	    var callback = queue[i];
	    var arg = queue[i + 1];

	    callback(arg);

	    queue[i] = undefined;
	    queue[i + 1] = undefined;
	  }

	  len = 0;
	}

	function attemptVertx() {
	  try {
	    var r = require;
	    var vertx = __webpack_require__(5);
	    vertxNext = vertx.runOnLoop || vertx.runOnContext;
	    return useVertxTimer();
	  } catch (e) {
	    return useSetTimeout();
	  }
	}

	var scheduleFlush = undefined;
	// Decide what async method to use to triggering processing of queued callbacks:
	if (isNode) {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else if (isWorker) {
	  scheduleFlush = useMessageChannel();
	} else if (browserWindow === undefined && "function" === 'function') {
	  scheduleFlush = attemptVertx();
	} else {
	  scheduleFlush = useSetTimeout();
	}

	function then(onFulfillment, onRejection) {
	  var _arguments = arguments;

	  var parent = this;

	  var child = new this.constructor(noop);

	  if (child[PROMISE_ID] === undefined) {
	    makePromise(child);
	  }

	  var _state = parent._state;

	  if (_state) {
	    (function () {
	      var callback = _arguments[_state - 1];
	      asap(function () {
	        return invokeCallback(_state, child, callback, parent._result);
	      });
	    })();
	  } else {
	    subscribe(parent, child, onFulfillment, onRejection);
	  }

	  return child;
	}

	/**
	  `Promise.resolve` returns a promise that will become resolved with the
	  passed `value`. It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    resolve(1);
	  });

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.resolve(1);

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  @method resolve
	  @static
	  @param {Any} value value that the returned promise will be resolved with
	  Useful for tooling.
	  @return {Promise} a promise that will become fulfilled with the given
	  `value`
	*/
	function resolve(object) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (object && typeof object === 'object' && object.constructor === Constructor) {
	    return object;
	  }

	  var promise = new Constructor(noop);
	  _resolve(promise, object);
	  return promise;
	}

	var PROMISE_ID = Math.random().toString(36).substring(16);

	function noop() {}

	var PENDING = void 0;
	var FULFILLED = 1;
	var REJECTED = 2;

	var GET_THEN_ERROR = new ErrorObject();

	function selfFulfillment() {
	  return new TypeError("You cannot resolve a promise with itself");
	}

	function cannotReturnOwn() {
	  return new TypeError('A promises callback cannot return that same promise.');
	}

	function getThen(promise) {
	  try {
	    return promise.then;
	  } catch (error) {
	    GET_THEN_ERROR.error = error;
	    return GET_THEN_ERROR;
	  }
	}

	function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	  try {
	    then.call(value, fulfillmentHandler, rejectionHandler);
	  } catch (e) {
	    return e;
	  }
	}

	function handleForeignThenable(promise, thenable, then) {
	  asap(function (promise) {
	    var sealed = false;
	    var error = tryThen(then, thenable, function (value) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	      if (thenable !== value) {
	        _resolve(promise, value);
	      } else {
	        fulfill(promise, value);
	      }
	    }, function (reason) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;

	      _reject(promise, reason);
	    }, 'Settle: ' + (promise._label || ' unknown promise'));

	    if (!sealed && error) {
	      sealed = true;
	      _reject(promise, error);
	    }
	  }, promise);
	}

	function handleOwnThenable(promise, thenable) {
	  if (thenable._state === FULFILLED) {
	    fulfill(promise, thenable._result);
	  } else if (thenable._state === REJECTED) {
	    _reject(promise, thenable._result);
	  } else {
	    subscribe(thenable, undefined, function (value) {
	      return _resolve(promise, value);
	    }, function (reason) {
	      return _reject(promise, reason);
	    });
	  }
	}

	function handleMaybeThenable(promise, maybeThenable, then$$) {
	  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
	    handleOwnThenable(promise, maybeThenable);
	  } else {
	    if (then$$ === GET_THEN_ERROR) {
	      _reject(promise, GET_THEN_ERROR.error);
	    } else if (then$$ === undefined) {
	      fulfill(promise, maybeThenable);
	    } else if (isFunction(then$$)) {
	      handleForeignThenable(promise, maybeThenable, then$$);
	    } else {
	      fulfill(promise, maybeThenable);
	    }
	  }
	}

	function _resolve(promise, value) {
	  if (promise === value) {
	    _reject(promise, selfFulfillment());
	  } else if (objectOrFunction(value)) {
	    handleMaybeThenable(promise, value, getThen(value));
	  } else {
	    fulfill(promise, value);
	  }
	}

	function publishRejection(promise) {
	  if (promise._onerror) {
	    promise._onerror(promise._result);
	  }

	  publish(promise);
	}

	function fulfill(promise, value) {
	  if (promise._state !== PENDING) {
	    return;
	  }

	  promise._result = value;
	  promise._state = FULFILLED;

	  if (promise._subscribers.length !== 0) {
	    asap(publish, promise);
	  }
	}

	function _reject(promise, reason) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	  promise._state = REJECTED;
	  promise._result = reason;

	  asap(publishRejection, promise);
	}

	function subscribe(parent, child, onFulfillment, onRejection) {
	  var _subscribers = parent._subscribers;
	  var length = _subscribers.length;

	  parent._onerror = null;

	  _subscribers[length] = child;
	  _subscribers[length + FULFILLED] = onFulfillment;
	  _subscribers[length + REJECTED] = onRejection;

	  if (length === 0 && parent._state) {
	    asap(publish, parent);
	  }
	}

	function publish(promise) {
	  var subscribers = promise._subscribers;
	  var settled = promise._state;

	  if (subscribers.length === 0) {
	    return;
	  }

	  var child = undefined,
	      callback = undefined,
	      detail = promise._result;

	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];

	    if (child) {
	      invokeCallback(settled, child, callback, detail);
	    } else {
	      callback(detail);
	    }
	  }

	  promise._subscribers.length = 0;
	}

	function ErrorObject() {
	  this.error = null;
	}

	var TRY_CATCH_ERROR = new ErrorObject();

	function tryCatch(callback, detail) {
	  try {
	    return callback(detail);
	  } catch (e) {
	    TRY_CATCH_ERROR.error = e;
	    return TRY_CATCH_ERROR;
	  }
	}

	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value = undefined,
	      error = undefined,
	      succeeded = undefined,
	      failed = undefined;

	  if (hasCallback) {
	    value = tryCatch(callback, detail);

	    if (value === TRY_CATCH_ERROR) {
	      failed = true;
	      error = value.error;
	      value = null;
	    } else {
	      succeeded = true;
	    }

	    if (promise === value) {
	      _reject(promise, cannotReturnOwn());
	      return;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }

	  if (promise._state !== PENDING) {
	    // noop
	  } else if (hasCallback && succeeded) {
	      _resolve(promise, value);
	    } else if (failed) {
	      _reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      _reject(promise, value);
	    }
	}

	function initializePromise(promise, resolver) {
	  try {
	    resolver(function resolvePromise(value) {
	      _resolve(promise, value);
	    }, function rejectPromise(reason) {
	      _reject(promise, reason);
	    });
	  } catch (e) {
	    _reject(promise, e);
	  }
	}

	var id = 0;
	function nextId() {
	  return id++;
	}

	function makePromise(promise) {
	  promise[PROMISE_ID] = id++;
	  promise._state = undefined;
	  promise._result = undefined;
	  promise._subscribers = [];
	}

	function Enumerator(Constructor, input) {
	  this._instanceConstructor = Constructor;
	  this.promise = new Constructor(noop);

	  if (!this.promise[PROMISE_ID]) {
	    makePromise(this.promise);
	  }

	  if (isArray(input)) {
	    this._input = input;
	    this.length = input.length;
	    this._remaining = input.length;

	    this._result = new Array(this.length);

	    if (this.length === 0) {
	      fulfill(this.promise, this._result);
	    } else {
	      this.length = this.length || 0;
	      this._enumerate();
	      if (this._remaining === 0) {
	        fulfill(this.promise, this._result);
	      }
	    }
	  } else {
	    _reject(this.promise, validationError());
	  }
	}

	function validationError() {
	  return new Error('Array Methods must be provided an Array');
	};

	Enumerator.prototype._enumerate = function () {
	  var length = this.length;
	  var _input = this._input;

	  for (var i = 0; this._state === PENDING && i < length; i++) {
	    this._eachEntry(_input[i], i);
	  }
	};

	Enumerator.prototype._eachEntry = function (entry, i) {
	  var c = this._instanceConstructor;
	  var resolve$$ = c.resolve;

	  if (resolve$$ === resolve) {
	    var _then = getThen(entry);

	    if (_then === then && entry._state !== PENDING) {
	      this._settledAt(entry._state, i, entry._result);
	    } else if (typeof _then !== 'function') {
	      this._remaining--;
	      this._result[i] = entry;
	    } else if (c === Promise) {
	      var promise = new c(noop);
	      handleMaybeThenable(promise, entry, _then);
	      this._willSettleAt(promise, i);
	    } else {
	      this._willSettleAt(new c(function (resolve$$) {
	        return resolve$$(entry);
	      }), i);
	    }
	  } else {
	    this._willSettleAt(resolve$$(entry), i);
	  }
	};

	Enumerator.prototype._settledAt = function (state, i, value) {
	  var promise = this.promise;

	  if (promise._state === PENDING) {
	    this._remaining--;

	    if (state === REJECTED) {
	      _reject(promise, value);
	    } else {
	      this._result[i] = value;
	    }
	  }

	  if (this._remaining === 0) {
	    fulfill(promise, this._result);
	  }
	};

	Enumerator.prototype._willSettleAt = function (promise, i) {
	  var enumerator = this;

	  subscribe(promise, undefined, function (value) {
	    return enumerator._settledAt(FULFILLED, i, value);
	  }, function (reason) {
	    return enumerator._settledAt(REJECTED, i, reason);
	  });
	};

	/**
	  `Promise.all` accepts an array of promises, and returns a new promise which
	  is fulfilled with an array of fulfillment values for the passed promises, or
	  rejected with the reason of the first passed promise to be rejected. It casts all
	  elements of the passed iterable to promises as it runs this algorithm.

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = resolve(2);
	  let promise3 = resolve(3);
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```

	  If any of the `promises` given to `all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = reject(new Error("2"));
	  let promise3 = reject(new Error("3"));
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```

	  @method all
	  @static
	  @param {Array} entries array of promises
	  @param {String} label optional string for labeling the promise.
	  Useful for tooling.
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	  @static
	*/
	function all(entries) {
	  return new Enumerator(this, entries).promise;
	}

	/**
	  `Promise.race` returns a new promise which is settled in the same way as the
	  first passed promise to settle.

	  Example:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 2');
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // result === 'promise 2' because it was resolved before promise1
	    // was resolved.
	  });
	  ```

	  `Promise.race` is deterministic in that only the state of the first
	  settled promise matters. For example, even if other promises given to the
	  `promises` array argument are resolved, but the first settled promise has
	  become rejected before the other promises became fulfilled, the returned
	  promise will become rejected:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error('promise 2'));
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // Code here never runs
	  }, function(reason){
	    // reason.message === 'promise 2' because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```

	  An example real-world use case is implementing timeouts:

	  ```javascript
	  Promise.race([ajax('foo.json'), timeout(5000)])
	  ```

	  @method race
	  @static
	  @param {Array} promises array of promises to observe
	  Useful for tooling.
	  @return {Promise} a promise which settles in the same way as the first passed
	  promise to settle.
	*/
	function race(entries) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (!isArray(entries)) {
	    return new Constructor(function (_, reject) {
	      return reject(new TypeError('You must pass an array to race.'));
	    });
	  } else {
	    return new Constructor(function (resolve, reject) {
	      var length = entries.length;
	      for (var i = 0; i < length; i++) {
	        Constructor.resolve(entries[i]).then(resolve, reject);
	      }
	    });
	  }
	}

	/**
	  `Promise.reject` returns a promise rejected with the passed `reason`.
	  It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.reject(new Error('WHOOPS'));

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  @method reject
	  @static
	  @param {Any} reason value that the returned promise will be rejected with.
	  Useful for tooling.
	  @return {Promise} a promise rejected with the given `reason`.
	*/
	function reject(reason) {
	  /*jshint validthis:true */
	  var Constructor = this;
	  var promise = new Constructor(noop);
	  _reject(promise, reason);
	  return promise;
	}

	function needsResolver() {
	  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	}

	function needsNew() {
	  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	}

	/**
	  Promise objects represent the eventual result of an asynchronous operation. The
	  primary way of interacting with a promise is through its `then` method, which
	  registers callbacks to receive either a promise's eventual value or the reason
	  why the promise cannot be fulfilled.

	  Terminology
	  -----------

	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	  - `thenable` is an object or function that defines a `then` method.
	  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	  - `exception` is a value that is thrown using the throw statement.
	  - `reason` is a value that indicates why a promise was rejected.
	  - `settled` the final resting state of a promise, fulfilled or rejected.

	  A promise can be in one of three states: pending, fulfilled, or rejected.

	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	  state.  Promises that are rejected have a rejection reason and are in the
	  rejected state.  A fulfillment value is never a thenable.

	  Promises can also be said to *resolve* a value.  If this value is also a
	  promise, then the original promise's settled state will match the value's
	  settled state.  So a promise that *resolves* a promise that rejects will
	  itself reject, and a promise that *resolves* a promise that fulfills will
	  itself fulfill.


	  Basic Usage:
	  ------------

	  ```js
	  let promise = new Promise(function(resolve, reject) {
	    // on success
	    resolve(value);

	    // on failure
	    reject(reason);
	  });

	  promise.then(function(value) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Advanced Usage:
	  ---------------

	  Promises shine when abstracting away asynchronous interactions such as
	  `XMLHttpRequest`s.

	  ```js
	  function getJSON(url) {
	    return new Promise(function(resolve, reject){
	      let xhr = new XMLHttpRequest();

	      xhr.open('GET', url);
	      xhr.onreadystatechange = handler;
	      xhr.responseType = 'json';
	      xhr.setRequestHeader('Accept', 'application/json');
	      xhr.send();

	      function handler() {
	        if (this.readyState === this.DONE) {
	          if (this.status === 200) {
	            resolve(this.response);
	          } else {
	            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	          }
	        }
	      };
	    });
	  }

	  getJSON('/posts.json').then(function(json) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Unlike callbacks, promises are great composable primitives.

	  ```js
	  Promise.all([
	    getJSON('/posts'),
	    getJSON('/comments')
	  ]).then(function(values){
	    values[0] // => postsJSON
	    values[1] // => commentsJSON

	    return values;
	  });
	  ```

	  @class Promise
	  @param {function} resolver
	  Useful for tooling.
	  @constructor
	*/
	function Promise(resolver) {
	  this[PROMISE_ID] = nextId();
	  this._result = this._state = undefined;
	  this._subscribers = [];

	  if (noop !== resolver) {
	    typeof resolver !== 'function' && needsResolver();
	    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	  }
	}

	Promise.all = all;
	Promise.race = race;
	Promise.resolve = resolve;
	Promise.reject = reject;
	Promise._setScheduler = setScheduler;
	Promise._setAsap = setAsap;
	Promise._asap = asap;

	Promise.prototype = {
	  constructor: Promise,

	  /**
	    The primary way of interacting with a promise is through its `then` method,
	    which registers callbacks to receive either a promise's eventual value or the
	    reason why the promise cannot be fulfilled.
	  
	    ```js
	    findUser().then(function(user){
	      // user is available
	    }, function(reason){
	      // user is unavailable, and you are given the reason why
	    });
	    ```
	  
	    Chaining
	    --------
	  
	    The return value of `then` is itself a promise.  This second, 'downstream'
	    promise is resolved with the return value of the first promise's fulfillment
	    or rejection handler, or rejected if the handler throws an exception.
	  
	    ```js
	    findUser().then(function (user) {
	      return user.name;
	    }, function (reason) {
	      return 'default name';
	    }).then(function (userName) {
	      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	      // will be `'default name'`
	    });
	  
	    findUser().then(function (user) {
	      throw new Error('Found user, but still unhappy');
	    }, function (reason) {
	      throw new Error('`findUser` rejected and we're unhappy');
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	    });
	    ```
	    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	  
	    ```js
	    findUser().then(function (user) {
	      throw new PedagogicalException('Upstream error');
	    }).then(function (value) {
	      // never reached
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // The `PedgagocialException` is propagated all the way down to here
	    });
	    ```
	  
	    Assimilation
	    ------------
	  
	    Sometimes the value you want to propagate to a downstream promise can only be
	    retrieved asynchronously. This can be achieved by returning a promise in the
	    fulfillment or rejection handler. The downstream promise will then be pending
	    until the returned promise is settled. This is called *assimilation*.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // The user's comments are now available
	    });
	    ```
	  
	    If the assimliated promise rejects, then the downstream promise will also reject.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // If `findCommentsByAuthor` fulfills, we'll have the value here
	    }, function (reason) {
	      // If `findCommentsByAuthor` rejects, we'll have the reason here
	    });
	    ```
	  
	    Simple Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let result;
	  
	    try {
	      result = findResult();
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	    findResult(function(result, err){
	      if (err) {
	        // failure
	      } else {
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findResult().then(function(result){
	      // success
	    }, function(reason){
	      // failure
	    });
	    ```
	  
	    Advanced Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let author, books;
	  
	    try {
	      author = findAuthor();
	      books  = findBooksByAuthor(author);
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	  
	    function foundBooks(books) {
	  
	    }
	  
	    function failure(reason) {
	  
	    }
	  
	    findAuthor(function(author, err){
	      if (err) {
	        failure(err);
	        // failure
	      } else {
	        try {
	          findBoooksByAuthor(author, function(books, err) {
	            if (err) {
	              failure(err);
	            } else {
	              try {
	                foundBooks(books);
	              } catch(reason) {
	                failure(reason);
	              }
	            }
	          });
	        } catch(error) {
	          failure(err);
	        }
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findAuthor().
	      then(findBooksByAuthor).
	      then(function(books){
	        // found books
	    }).catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method then
	    @param {Function} onFulfilled
	    @param {Function} onRejected
	    Useful for tooling.
	    @return {Promise}
	  */
	  then: then,

	  /**
	    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	    as the catch block of a try/catch statement.
	  
	    ```js
	    function findAuthor(){
	      throw new Error('couldn't find that author');
	    }
	  
	    // synchronous
	    try {
	      findAuthor();
	    } catch(reason) {
	      // something went wrong
	    }
	  
	    // async with promises
	    findAuthor().catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method catch
	    @param {Function} onRejection
	    Useful for tooling.
	    @return {Promise}
	  */
	  'catch': function _catch(onRejection) {
	    return this.then(null, onRejection);
	  }
	};

	function polyfill() {
	    var local = undefined;

	    if (typeof global !== 'undefined') {
	        local = global;
	    } else if (typeof self !== 'undefined') {
	        local = self;
	    } else {
	        try {
	            local = Function('return this')();
	        } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	        }
	    }

	    var P = local.Promise;

	    if (P) {
	        var promiseToString = null;
	        try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	        } catch (e) {
	            // silently ignored
	        }

	        if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	        }
	    }

	    local.Promise = Promise;
	}

	polyfill();
	// Strange compat..
	Promise.polyfill = polyfill;
	Promise.Promise = Promise;

	return Promise;

	})));
	//# sourceMappingURL=es6-promise.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	var SubscriptionToken = (function () {
	    function SubscriptionToken(onDispose, count) {
	        this.isDisposed = false;
	        this.disposeFn = onDispose;
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
	}());
	exports.SubscriptionToken = SubscriptionToken;
	//# sourceMappingURL=subscription-token.js.map

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var es6_promise_1 = __webpack_require__(3);
	var string_validation_1 = __webpack_require__(8);
	var helper_1 = __webpack_require__(9);
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
	        this.stringValidator = pubsub.stringValidator;
	        this.enablePlainObjectCheck = pubsub.enablePlainObjectCheck;
	    }
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
	    ChannelValidated.prototype.setTopicChannelNameValidator = function (validator) {
	        this.stringValidator = validator;
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

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	var DefaultTopicChannelNameValidator = (function () {
	    function DefaultTopicChannelNameValidator(settings) {
	        if (!settings) {
	            settings = {
	                channelNameMaxLength: 63,
	                topicNameMaxLength: 255
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

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var es6_promise_1 = __webpack_require__(3);
	function safeDispose(token) {
	    if (!token)
	        throw new Error("token must be defined!");
	    if (!token.isDisposed)
	        return token.dispose();
	    else
	        return es6_promise_1.Promise.resolve(undefined);
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

/***/ }
/******/ ])
});
;