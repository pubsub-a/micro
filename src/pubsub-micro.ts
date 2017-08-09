import {
    IPubSub,
    IChannel,
    ISubscriptionToken,
    IObserverFunc,
    StopReason
} from '@dynalon/pubsub-a-interfaces';

import { BucketHash } from './buckethash';
import * as InternalInterfaces from './internal-interfaces';
import { SubscriptionToken } from './subscription-token';
import { PubSubValidationWrapper } from "./validation-wrapper";
import { invokeIfDefined, safeDispose } from "./helper";

export type SubscriptionCache = BucketHash<IObserverFunc<any>>;

export class PubSubMicroValidated extends PubSubValidationWrapper {

    /**
     * To allow shared/link PubSub instances (for testing)
     * expose the subscriptionCache so we can pass it to
     * other instances
     */
    public get subscriptionCache() {
        return (this.pubsub as PubSubMicroUnvalidated).subscriptionCache as SubscriptionCache;
    }

    constructor(subscriptionCache?: SubscriptionCache) {
        super(new PubSubMicroUnvalidated(subscriptionCache));
    }
}

export class PubSubMicroUnvalidated implements IPubSub {

    public readonly subscriptionCache: SubscriptionCache

    public isStopped = false;
    public isStarted = false;

    public onStart: Promise<void>;
    public onStop: Promise<StopReason | undefined>;

    public clientId: string = "";

    private notifyStart: () => void;
    private notifyStop: (reason?: StopReason) => void;

    constructor(subscriptionCache?: SubscriptionCache) {
        if (subscriptionCache === undefined)
            this.subscriptionCache = new BucketHash<IObserverFunc<any>>();
        else
            this.subscriptionCache = subscriptionCache;

        this.onStart = new Promise<void>((resolve, reject) => {
            this.notifyStart = () => resolve();
        })

        this.onStop = new Promise<StopReason | undefined>((resolve, reject) => {
            this.notifyStop = (reason) => resolve(reason);
        })
    }

    start(disconnect?: Function): Promise<IPubSub> {
        this.notifyStart();
        return Promise.resolve(this);
    }

    stop(reason: StopReason = "LOCAL_DISCONNECT"): Promise<void> {
        this.notifyStop(reason);
        this.isStopped = true;
        return Promise.resolve(void 0);
    }

    channel(name: string): Promise<IChannel> {
        const channel = new Channel(name, this);
        return Promise.resolve(channel);
    }
}

class Publisher<T> implements InternalInterfaces.IPublisher<T> {

    encodedTopic: string;

    private bucket: SubscriptionCache

    constructor(encodedTopic: string, bucket: SubscriptionCache) {
        this.encodedTopic = encodedTopic;
        this.bucket = bucket;
    }

    publish(obj: T): void {
        var subs = this.bucket.get(this.encodedTopic);
        for (let observer of subs) {
            try {
                observer(obj);
            } catch (err) {
                // we don't handle exceptions the observer functions throws,
                // it is observer functions duty to catch errors and handle them
            }
        }
    }
}

class Subscriber<T> implements InternalInterfaces.ISubscriber<T> {

    constructor(public encodedTopic: string, private bucket: SubscriptionCache) {
    }

    subscribe(observer: IObserverFunc<T>): ISubscriptionToken {
        const number_of_subscriptions = this.bucket.add(this.encodedTopic, observer);

        const onDispose = () => {
            const remaining = this.bucket.remove(this.encodedTopic, observer);
            return Promise.resolve(remaining);
        };

        return new SubscriptionToken(onDispose, number_of_subscriptions);
    }
}

class Channel implements IChannel {

    name: string;

    private get bucket() {
        return this.pubsub.subscriptionCache;
    };

    public pubsub: PubSubMicroUnvalidated;

    constructor(name: string, pubsub: PubSubMicroUnvalidated) {
        this.name = name;
        this.pubsub = pubsub;
    }

    /**
     * We encode the channel namen and the topic into a single string to place in the BucketHash.
     * This way all channel/topic combinations will share subscriptions, independent of the current
     * instance of the Channel object.
     *
     * For example, two different Channel object instances will trigger each others subscriptions this way.
     */
    private encodeTopic(topic: string): string {
        const encodedTopic = `${this.name}_%_${topic}`;
        return encodedTopic;
    }

    publish<T>(topic: string, payload: T, callback?: Function): Promise<any> {
        var publisher = new Publisher<T>(this.encodeTopic(topic), this.bucket);
        publisher.publish(payload);
        invokeIfDefined(callback, topic, payload);
        return Promise.resolve();
    }

    subscribe<T>(topic: string, observer: IObserverFunc<T>)
        : Promise<ISubscriptionToken> {

        if (!observer) {
            throw new Error("observer function must be given and be of type function");
        }

        const subscriber = new Subscriber<T>(this.encodeTopic(topic), this.bucket);
        const subscription = subscriber.subscribe(observer);

        return Promise.resolve(subscription);
    }


    once<T>(topic: string, observer: IObserverFunc<T>): Promise<ISubscriptionToken> {

        let promise: Promise<ISubscriptionToken>;
        let alreadyRun = false;

        let subscribeAndDispose: IObserverFunc<T> = ((payload: T) => {
            if (alreadyRun) return;
            alreadyRun = true;

            promise.then(subs => {
                // the user may have disposed the subscription himself, so we need to check if it is still active
                safeDispose(subs);
            });
            observer(payload);
        }).bind(observer);

        promise = this.subscribe<T>(topic, subscribeAndDispose);
        return promise;
    }

}
