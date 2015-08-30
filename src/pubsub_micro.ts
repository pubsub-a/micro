
module PubSubA {

  export function invokeIfDefined (func:Function, ...args: any[]) {
    if (func) {
      func.apply(func, args);
    }
  }

  export class ChannelStatic {

    // publish & subscribe are stubs that MUST be implemented by the deriving class
    publish<T> (topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void
    {
      throw new Error('This method must be override by implementations');
    }

    subscribe<T> (topic: string, subscription: ISubscriptionFunc<T>, callback?: Function)
      : ISubscriptionToken
    {
      throw new Error('This method must be override by implementations');
    }

    // The following code should only be overriden in rare cases, you should not implement/override
    // beyond this point!

    once<T> (topic: string, subscription: ISubscriptionFunc<T>, callback?: Function)
      : ISubscriptionToken
    {
      var internal_subs;
      var wrapperInnerFunc = (payload: T) => {
        internal_subs.dispose();
        subscription (payload);
      };
      var wrapperFunc = wrapperInnerFunc.bind (subscription);
      internal_subs = this.subscribe<T> (topic, wrapperFunc, callback);
      return internal_subs;
    }
  }

  export class MicroPubSub implements IPubSub {
   
    private subscriptionCache;

    constructor () {
      this.subscriptionCache = new BucketHash<ISubscriptionFunc<any>> ();
    }

    start (callback?: IPubSubStartCallback) {
      invokeIfDefined(callback, this, undefined, undefined);
    }

    stop (callback?: IPubSubStopCallback) {
      invokeIfDefined(callback);
    }

    channel (name: string, callback: IChannelReadyCallback): IChannel {
      var channel = new Channel(name, this.subscriptionCache);
      if (callback)
        callback(channel, this);
      return channel;
    }

    public static includeIn (obj: any, publish_name?: string, subscribe_name?: string): any {
      return PubSubA.internalIncludeIn(obj, publish_name, subscribe_name);
    }
  }

  class Publisher<T> implements PubSubA.InternalInterfaces.IPublisher<T> {

    constructor (public name: string, private cache: IBucketHash<ISubscriptionFunc<any>>) {
    }

    publish (obj: T): void {
      var subs = this.cache.get(this.name);
      for (var i = 0; i < subs.length; i++) {
        subs[i](obj);
      }
    }
  }

  class Subscriber<T> implements PubSubA.InternalInterfaces.ISubscriber<T> {

    constructor (public name: string, private cache: IBucketHash<ISubscriptionFunc<T>>) {
    }

    subscribe(cb: ISubscriptionFunc<T>): ISubscriptionToken {
      var number_of_subscriptions = this.cache.add (this.name, cb);

      var dispose = (callback?: SubscriptionDisposedCallback) => { 
        var remaining = this.cache.remove (this.name, cb);
        invokeIfDefined(callback, remaining);
        return remaining;
      };

      return new SubscriptionToken (dispose, number_of_subscriptions);
    }
  }

  class Channel extends ChannelStatic implements IChannel {
    constructor (public name: string, private cache: IBucketHash<ISubscriptionFunc<any>>) {
      super();
    }

    publish<T> (topic: string, payload: T, callback?: Function) {
      var publisher = new Publisher<T> (topic, this.cache);
      publisher.publish(payload);
      invokeIfDefined(callback, topic, payload);
    }

    subscribe<T> (topic: string, subscription: ISubscriptionFunc<T>, callback?: Function) 
      : ISubscriptionToken
    { 

      var subscriber = new Subscriber<T> (topic, this.cache);
      var subscriptionHandle = subscriber.subscribe (subscription);

      invokeIfDefined(callback, subscriptionHandle, topic, subscription);
      return subscriptionHandle;
    }

  }
}