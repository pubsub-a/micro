import {
    IObserverFunc,
    ISubscriptionToken,
} from '@dynalon/pubsub-a-interfaces';

import { SubscriptionToken } from './subscription-token';

export interface IPublisher<T> {
    publish(obj: T, callback?: Function): void;
}

export interface ISubscriber<T> {
    subscribe(observer: IObserverFunc<T>, callback?: Function): ISubscriptionToken;
}
