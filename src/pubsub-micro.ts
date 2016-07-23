import {
IPubSub,
IChannel,
IPublishReceivedCallback,
ISubscriptionToken,
ISubscriptionFunc,
IPubSubStartCallback,
IPubSubStopCallback,
IChannelReadyCallback,
SubscriptionDisposedCallback
} from 'pubsub-a-interface';

import {Promise} from "es6-promise";
import { BucketHash, IBucketHash } from './buckethash';
import * as InternalInterfaces from './internal-interfaces';
import { SubscriptionToken } from './subscription-token';
import Util from './util';

export function invokeIfDefined(func: Function | undefined | null, ...args: any[]) {
    if (func) {
        func.apply(func, args);
    }
}
export {BucketHash} from "./buckethash";

export class PubSub implements IPubSub {

    private subscriptionCache;

    constructor() {
        this.subscriptionCache = new BucketHash<ISubscriptionFunc<any>>();
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

    private _subscribe(fn: ISubscriptionFunc<T>) {
        return this.channel.subscribe('a', fn);
    }

    private _publish(payload: T) {
        return this.channel.publish('a', payload);
    }

    public subscribe: (fn: ISubscriptionFunc<T>) => ISubscriptionToken;
    public publish: (payload: T) => void;

    constructor() {
        var pubsub = new PubSub();
        pubsub.channel('__i', (chan) => { this.channel = chan });

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

    constructor(public name: string, private cache: IBucketHash<ISubscriptionFunc<any>>) {
    }

    publish(obj: T): void {
        var subs = this.cache.get(this.name);
        for (var i = 0; i < subs.length; i++) {
            subs[i](obj);
        }
    }
}

class Subscriber<T> implements InternalInterfaces.ISubscriber<T> {

    constructor(public name: string, private cache: IBucketHash<ISubscriptionFunc<T>>) {
    }

    subscribe(cb: ISubscriptionFunc<T>): ISubscriptionToken {
        var number_of_subscriptions = this.cache.add(this.name, cb);

        var dispose = (callback?: SubscriptionDisposedCallback) => {
            var remaining = this.cache.remove(this.name, cb);
            invokeIfDefined(callback, remaining);
            return remaining;
        };

        return new SubscriptionToken(dispose, number_of_subscriptions);
    }
}

class Channel implements IChannel {
    constructor(public name: string, private cache: IBucketHash<ISubscriptionFunc<any>>) {
        this.name = name;
    }

    private encodeTopic(topic): string {
        if (topic.indexOf("%") !==  -1) {
            throw "The percent character (%) is not allowed in topic names";
        }

        const encodedTopic = `${this.name}%${topic}`;
        return encodedTopic;
    }

    publish<T>(topic: string, payload: T, callback?: Function) {
        var publisher = new Publisher<T>(this.encodeTopic(topic), this.cache);
        publisher.publish(payload);
        invokeIfDefined(callback, topic, payload);
    }

    subscribe<T>(topic: string, subscription: ISubscriptionFunc<T>, callback?: Function)
        : ISubscriptionToken {

        var subscriber = new Subscriber<T>(this.encodeTopic(topic), this.cache);
        var subscriptionHandle = subscriber.subscribe(subscription);

        invokeIfDefined(callback, subscriptionHandle, topic, subscription);
        return subscriptionHandle;
    }

    once<T>(topic: string, subscription: ISubscriptionFunc<T>, callback?: Function)
        : ISubscriptionToken {
        var internal_subs;
        var wrapperInnerFunc = (payload: T) => {
            internal_subs.dispose();
            subscription(payload);
        };
        var wrapperFunc = wrapperInnerFunc.bind(subscription);
        internal_subs = this.subscribe<T>(this.encodeTopic(topic), wrapperFunc, callback);
        return internal_subs;
    }

}
