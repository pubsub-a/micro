module PubSubA.InternalInterfaces {

  export interface IPublisher<T> {
    publish(obj: T, callback?: Function): void;
  }

  export interface ISubscriber<T> {
    subscribe (fn: ISubscriptionFunc<T>, callback?: Function): ISubscriptionToken;
  }
}