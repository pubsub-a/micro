import { ObserverFunc, SubscriptionToken } from "@pubsub-a/interfaces";

export interface Publisher<T> {
    publish(obj: T, callback?: Function): void;
}

export interface Subscriber<T> {
    subscribe(observer: ObserverFunc<T>, callback?: Function): SubscriptionToken;
}
