module PubSub {

  export class AnonymousPubSub<T> {
    private channel: IChannel;

    private _subscribe (fn: ISubscriptionFunc<T>) {
      return this.channel.subscribe('a', fn);
    }

    private _publish (payload: T) {
      return this.channel.publish('a', payload);
    }

    public subscribe: (fn: ISubscriptionFunc<T>) => ISubscriptionToken;
    public on: (fn: ISubscriptionFunc<T>) => ISubscriptionToken;
    public publish: (payload: T) => void;
    public trigger: (payload: T) => void;

    constructor () {
      this.channel = new PubSub.MicroPubSub().channel('i');
      this.subscribe = this.on = this._subscribe.bind(this);
      this.publish = this.trigger = this._publish.bind(this);
    }

    public static includeIn (
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
}
