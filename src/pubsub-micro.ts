import {
    IPubSub,
    IChannel,
    IPublishReceivedCallback,
    ISubscriptionToken,
    IObserverFunc,
    IPubSubStartCallback,
    IPubSubStopCallback,
    IChannelReadyCallback,
    SubscriptionDisposedCallback,
    ISubscriptionRegisteredCallback
} from 'pubsub-a-interface';

import { Promise } from "es6-promise";
import { BucketHash, IBucketHash } from './buckethash';
import * as InternalInterfaces from './internal-interfaces';
import { SubscriptionToken } from './subscription-token';
import Util from './util';
import {PubSubMicro} from "./pubsub-stringvalidated";

export function invokeIfDefined(func: Function | undefined | null, ...args: any[]) {
    if (func) {
        func.apply(func, args);
    }
}

export class PubSubMicroUnvalidated implements IPubSub {

    private subscriptionCache: BucketHash<IObserverFunc<any>>;

    constructor() {
        this.subscriptionCache = new BucketHash<IObserverFunc<any>>();
    }

    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub> {
        invokeIfDefined(callback, this, undefined, undefined);
        return Promise.resolve(this);
    }

    stop(callback?: IPubSubStopCallback): Promise<void> {
        invokeIfDefined(callback);
        return Promise.resolve(void 0);
    }

    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel> {
        var channel = new Channel(name, this.subscriptionCache);
        invokeIfDefined(callback, channel);
        return Promise.resolve(channel);
    }

    public static includeIn(obj: any, publish_name?: string, subscribe_name?: string): any {
        return internalIncludeIn(obj, publish_name, subscribe_name);
    }

    /**
     * Helper functions that expose some internals that are reused in sister projects
     */
    public static BucketHash = BucketHash;
    public static invokeIfDefined: any = invokeIfDefined;
    public static SubscriptionToken: any = SubscriptionToken;
    public static Util: any = Util;
}


class AnonymousPubSub<T> {
    private channel: IChannel;

    private _subscribe(fn: IObserverFunc<T>) {
        return this.channel.subscribe('a', fn);
    }

    private _publish(payload: T) {
        return this.channel.publish('a', payload);
    }

    public subscribe: (fn: IObserverFunc<T>) => ISubscriptionToken;
    public publish: (payload: T) => void;

    constructor() {
        var pubsub = new PubSubMicroUnvalidated();
        pubsub.channel('__i', (chan) => { this.channel = chan });

        this.subscribe = this._subscribe.bind(this);
        this.publish = this._publish.bind(this);
    }
}

function internalIncludeIn(
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

class Publisher<T> implements InternalInterfaces.IPublisher<T> {

    constructor(public encodedTopic: string, private cache: IBucketHash<IObserverFunc<any>>) {
    }

    publish(obj: T): void {
        var subs = this.cache.get(this.encodedTopic);
        for (var i = 0; i < subs.length; i++) {
            subs[i](obj);
        }
    }
}

class Subscriber<T> implements InternalInterfaces.ISubscriber<T> {

    constructor(public encodedTopic: string, private bucket: IBucketHash<IObserverFunc<T>>) {
    }

    subscribe(observer: IObserverFunc<T>): ISubscriptionToken {
        var number_of_subscriptions = this.bucket.add(this.encodedTopic, observer);

        var dispose = (callback?: SubscriptionDisposedCallback) => {
            var remaining = this.bucket.remove(this.encodedTopic, observer);
            invokeIfDefined(callback, remaining);
            return remaining;
        };

        return new SubscriptionToken(dispose, number_of_subscriptions);
    }
}

class Channel implements IChannel {

    constructor(public name: string, private bucket: IBucketHash<IObserverFunc<any>>) {
        this.name = name;
    }

    /**
     * We encode the channel namen and the topic into a single string to place in the BucketHash.
     * This way all channel/topic combinations will share subscriptions, independent of the current
     * instance of the Channel object.
     *
     * For example, two different Channel object instances will trigger each others subscriptions this way.
     */
    private encodeTopic(topic): string {
        const encodedTopic = `${this.name}_%_${topic}`;
        return encodedTopic;
    }

    publish<T>(topic: string, payload: T, callback?: Function) {
        var publisher = new Publisher<T>(this.encodeTopic(topic), this.bucket);
        publisher.publish(payload);
        invokeIfDefined(callback, topic, payload);
    }

    subscribe<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>)
        : Promise<ISubscriptionToken> {

        if (!observer) {
            throw new Error("observer function must be given and be of type function");
        }

        const subscriber = new Subscriber<T>(this.encodeTopic(topic), this.bucket);
        const subscription = subscriber.subscribe(observer);

        invokeIfDefined(callback, subscription, topic, observer);
        return Promise.resolve(subscription);
    }


    once<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>)
        : Promise<ISubscriptionToken> {

        let subscription;
        let subscribeAndDispose = ((payload: T) => {
            subscription.dispose();
            observer(payload);
        }).bind(observer);
        subscription = this.subscribe<T>(topic, subscribeAndDispose, callback);
        return Promise.resolve(subscription);
    }

}
