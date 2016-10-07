import { IObserverFunc, ISubscriptionToken } from 'pubsub-a-interfaces';
export interface IPublisher<T> {
    publish(obj: T, callback?: Function): void;
}
export interface ISubscriber<T> {
    subscribe(observer: IObserverFunc<T>, callback?: Function): ISubscriptionToken;
}
