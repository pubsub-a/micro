var PubSubA;
(function (PubSubA) {
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
    PubSubA.BucketHash = BucketHash;
})(PubSubA || (PubSubA = {}));



var PubSubA;
(function (PubSubA) {
    var AnonymousPubSub = (function () {
        function AnonymousPubSub() {
            var pubsub = new PubSubA.MicroPubSub();
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
    PubSubA.internalIncludeIn = internalIncludeIn;
})(PubSubA || (PubSubA = {}));

var PubSubA;
(function (PubSubA) {
    var provider = [];
    function addProvider(name, ctor) {
        provider[name] = ctor;
    }
    PubSubA.addProvider = addProvider;
    function create(name, options) {
        if (!provider[name]) {
            throw new Error('Provider with name: ' + name + ' could not be found, did you forget to include the source?');
        }
        var ctor = provider[name];
        return ctor.call(PubSubA, options);
    }
    PubSubA.create = create;
    function getProvider() {
        return provider;
    }
    PubSubA.getProvider = getProvider;
    // register MicroPubSub immediately
    // HACK this relys on the compile order of typescript, find a better way to execute after
    // both registry and MicroPubSub are declared
    // TODO should we return the same instance, always?
    (function () {
        PubSubA.addProvider('local', function () { return new PubSubA.MicroPubSub(); });
    }());
    (function () {
        PubSubA.addProvider('autobahn', function (options) {
            //return new PubSubA.Autobahn.AutobahnPubSub(options);
        });
    }());
})(PubSubA || (PubSubA = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PubSubA;
(function (PubSubA) {
    function invokeIfDefined(func) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (func) {
            func.apply(func, args);
        }
    }
    PubSubA.invokeIfDefined = invokeIfDefined;
    var ChannelStatic = (function () {
        function ChannelStatic() {
        }
        // publish & subscribe are stubs that MUST be implemented by the deriving class
        ChannelStatic.prototype.publish = function (topic, payload, callback) {
            throw new Error('This method must be override by implementations');
        };
        ChannelStatic.prototype.subscribe = function (topic, subscription, callback) {
            throw new Error('This method must be override by implementations');
        };
        // The following code should only be overriden in rare cases, you should not implement/override
        // beyond this point!
        ChannelStatic.prototype.once = function (topic, subscription, callback) {
            var internal_subs;
            var wrapperInnerFunc = function (payload) {
                internal_subs.dispose();
                subscription(payload);
            };
            var wrapperFunc = wrapperInnerFunc.bind(subscription);
            internal_subs = this.subscribe(topic, wrapperFunc, callback);
            return internal_subs;
        };
        return ChannelStatic;
    })();
    PubSubA.ChannelStatic = ChannelStatic;
    var MicroPubSub = (function () {
        function MicroPubSub() {
            this.subscriptionCache = new PubSubA.BucketHash();
        }
        MicroPubSub.prototype.start = function (callback) {
            invokeIfDefined(callback, this, undefined, undefined);
        };
        MicroPubSub.prototype.stop = function (callback) {
            invokeIfDefined(callback);
        };
        MicroPubSub.prototype.channel = function (name, callback) {
            var channel = new Channel(name, this.subscriptionCache);
            if (callback)
                callback(channel);
            return channel;
        };
        MicroPubSub.includeIn = function (obj, publish_name, subscribe_name) {
            return PubSubA.internalIncludeIn(obj, publish_name, subscribe_name);
        };
        return MicroPubSub;
    })();
    PubSubA.MicroPubSub = MicroPubSub;
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
            return new PubSubA.SubscriptionToken(dispose, number_of_subscriptions);
        };
        return Subscriber;
    })();
    var Channel = (function (_super) {
        __extends(Channel, _super);
        function Channel(name, cache) {
            _super.call(this);
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
        return Channel;
    })(ChannelStatic);
})(PubSubA || (PubSubA = {}));

var PubSubA;
(function (PubSubA) {
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
    PubSubA.SubscriptionToken = SubscriptionToken;
})(PubSubA || (PubSubA = {}));

var PubSubA;
(function (PubSubA) {
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
    PubSubA.Util = Util;
})(PubSubA || (PubSubA = {}));
