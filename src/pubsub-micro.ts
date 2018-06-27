import { Channel as IChannel, ChannelType, ObserverFunc, PubSub, StopStatus, SubscriptionToken } from '@dynalon/pubsub-a-interfaces';
import { BucketHash } from './buckethash';
import { invokeIfDefined, safeDispose } from "./helper";
import * as InternalInterfaces from './internal-interfaces';
import { SubscriptionTokenImpl } from './subscription-token';
import { DefaultValidator, NameValidator } from './string-validation';


export type SubscriptionCache = BucketHash<ObserverFunc<any>>;


// export class PubSubMicroValidated extends PubSubValidationWrapper {

//     /**
//      * To allow shared/link PubSub instances (for testing)
//      * expose the subscriptionCache so we can pass it to
//      * other instances
//      */
//     public get subscriptionCache() {
//         return (this.pubsub as PubSubMicroUnvalidated).subscriptionCache as SubscriptionCache;
//     }

//     constructor(subscriptionCache?: SubscriptionCache) {
//         super(new PubSubMicroUnvalidated(subscriptionCache));
//     }
// }

export class PubSubMicro implements PubSub {

    public readonly subscriptionCache: SubscriptionCache
    public readonly validator: NameValidator;

    public isStopped = false;
    public isStarted = false;

    public onStart: Promise<void>;
    public onStop: Promise<StopStatus>;

    public clientId: string = "";

    private notifyStart: (() => void) | undefined;
    private notifyStop: ((status: StopStatus) => void) | undefined;

    constructor(linkedInstance?: PubSubMicro, validator?: NameValidator) {
        this.subscriptionCache = linkedInstance
            ? linkedInstance.subscriptionCache
            : new BucketHash<ObserverFunc<any>>();

        this.validator = validator || new DefaultValidator();

        this.onStart = new Promise<void>((resolve, reject) => {
            this.notifyStart = () => resolve();
        })

        this.onStop = new Promise<StopStatus>((resolve, reject) => {
            this.notifyStop = (reason) => resolve(reason);
        })
    }

    start(): Promise<PubSub> {
        if (this.isStarted === true) {
            throw new Error("Instance already started");
        }

        this.isStarted = true;
        this.notifyStart!();
        return Promise.resolve(this);
    }

    stop(status: StopStatus = { reason: "LOCAL_DISCONNECT" }): Promise<void> {
        if (this.isStarted !== true) {
            throw new Error("Can not stop instance before it was started");
        }

        if (this.isStopped === true) {
            return Promise.resolve(void 0);
        }

        this.isStopped = true;
        this.notifyStop!(status);
        return Promise.resolve(void 0);
    }

    channel<TName extends string>(name: TName): Promise<ChannelType<TName>> {
        if (this.isStopped) {
            const err = "Instance is stopped";
            return Promise.reject(new Error(err));
        }
        if (typeof name !== "string")
            throw new Error("Channel name must be of type string");
        if (name.length === 0)
            throw new Error(`Channel name must be non-zerolength string`);

        // TODO if validation fails, reject the promise?
        this.validator.validateChannelName(name);

        if (name === "__internal") {
            throw new Error("No support for __internal channel yet");
        } else {
            const channel = new Channel(name, this);
            return Promise.resolve(channel as any);
        }
    }
}

class Publisher<T> implements InternalInterfaces.Publisher<T> {

    encodedTopic: string;

    private subscriptionCache: SubscriptionCache

    constructor(encodedTopic: string, subscriptionCache: SubscriptionCache) {
        this.encodedTopic = encodedTopic;
        this.subscriptionCache = subscriptionCache;
    }

    publish(obj: T): void {
        const subs = this.subscriptionCache.get(this.encodedTopic);
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

class Subscriber<T> implements InternalInterfaces.Subscriber<T> {

    constructor(public encodedTopic: string, private subscriptionCache: SubscriptionCache) {
    }

    subscribe(observer: ObserverFunc<T>): SubscriptionToken {
        const number_of_subscriptions = this.subscriptionCache.add(this.encodedTopic, observer);

        const onDispose = () => {
            const remaining = this.subscriptionCache.remove(this.encodedTopic, observer);
            return Promise.resolve(remaining);
        };

        return new SubscriptionTokenImpl(onDispose, number_of_subscriptions);
    }
}

class Channel implements IChannel {

    name: string;

    private get subscriptionCache() {
        return this.pubsub.subscriptionCache;
    };

    private readonly validator: NameValidator

    public pubsub: PubSubMicro;

    constructor(name: string, pubsub: PubSubMicro) {
        this.name = name;
        this.pubsub = pubsub;
        this.validator = pubsub.validator;
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
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)

        if (this.pubsub.isStopped) {
            const err = new Error(`publish after pubsub instance has stopped, encountered when publishing on topic: ${topic}`);
            return Promise.reject(err);
        }

        this.validator.validateTopicName(topic);

        const publisher = new Publisher<T>(this.encodeTopic(topic), this.subscriptionCache);
        publisher.publish(payload);
        invokeIfDefined(callback, topic, payload);
        return Promise.resolve();
    }

    subscribe<T>(topic: string, observer: ObserverFunc<T>): Promise<SubscriptionToken> {
        if (!observer) {
            throw new Error("observer function must be given and be of type function");
        }
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)

        if (this.pubsub.isStopped) {
            return Promise.reject("PubSub instance has stopped")
        }

        this.validator.validateTopicName(topic);

        const subscriber = new Subscriber<T>(this.encodeTopic(topic), this.subscriptionCache);
        const subscription = subscriber.subscribe(observer);

        return Promise.resolve(subscription);
    }

    once<T>(topic: string, observer: ObserverFunc<T>): Promise<SubscriptionToken> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string")
        this.validator.validateTopicName(topic);

        let promise: Promise<SubscriptionToken>;
        let alreadyRun = false;

        let subscribeAndDispose: ObserverFunc<T> = ((payload: T) => {
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
