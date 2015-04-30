
module PubSub {

  export function invokeIfDefined (func:Function, ...args: any[]) {
    if (func) {
      func.apply(func, args);
    }
  }

  export class PubSubProvider {
  
    public static get (type: string) {
      if (type === 'pubsub+socketio' || type === 'pubsub+tls+socketio') {
        return PubSub['Network']['SocketIO']['Client'];
      } else if (type === 'pubsub+signalr' || type === 'pubsub+tls+signalr') {
        // return PubSub.Network.SignalR.Client;
        return null;
      } else {
        throw new Error('Unknown provider: ' + type);
      }
    }
  }

  export class ChannelStatic {

    // publish & subscribe are stubs that MUST be implemented by the deriving class
    publish<T> (topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void
    {
    }

    subscribe<T> (topic: string, subscription: ISubscriptionFunc<T>, callback?: Function)
      : ISubscriptionToken
    {
      return void 0;
    }

    // add trigger & on alias
    trigger<T> (topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void {
      this.publish<T> (topic, payload, callback);
    }

    on<T> (topic: string, subscription: ISubscriptionFunc<T>, callback?: Function)
      : ISubscriptionToken
    {
      return this.subscribe<T> (topic, subscription, callback);
    }

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

    channel (name: string) {
      return new Channel (name, this.subscriptionCache);
    }
  }

  class Publisher<T> implements PubSub.InternalInterfaces.IPublisher<T> {

    constructor (public name: string, private cache: IBucketHash<ISubscriptionFunc<any>>) {
    }

    publish (obj: T): void {
      var subs = this.cache.get(this.name);
      for (var i = 0; i < subs.length; i++) {
        subs[i](obj);
      }
    }
  }

  class Subscriber<T> implements PubSub.InternalInterfaces.ISubscriber<T> {

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