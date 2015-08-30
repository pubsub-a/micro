module PubSubA {

  class AnonymousPubSub<T> {
    private channel: IChannel;

    private _subscribe (fn: ISubscriptionFunc<T>) {
      return this.channel.subscribe('a', fn);
    }

    private _publish (payload: T) {
      return this.channel.publish('a', payload);
    }

    public subscribe: (fn: ISubscriptionFunc<T>) => ISubscriptionToken;
    public publish: (payload: T) => void;

    constructor () {
      var pubsub = new PubSubA.MicroPubSub();
      this.channel = pubsub.channel('__i', undefined);

      this.subscribe = this._subscribe.bind(this);
      this.publish = this._publish.bind(this);
    }
  }

  export function internalIncludeIn(
    obj: Object,
    publishName: string = 'publish',
    subscribeName: string = 'subscribe'
  ) {
    // TODO obj must be instanceof/child of Object ?
    var pubsub = new AnonymousPubSub();
    obj[subscribeName] = pubsub.subscribe;
    obj[publishName] = pubsub.publish;
    return obj;
  }
}
