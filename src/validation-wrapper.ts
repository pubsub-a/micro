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
import { PubSubMicroUnvalidated } from "./pubsub-micro";
import { TopicChannelNameValidator, DefaultTopicChannelNameValidator, DefaultTopicChannelNameValidatorSettings } from "./string-validation";
import { invokeIfDefined } from "./helper";

function throwIfStopped(this: { isStopped: boolean }, msg?: string) {
    if (this.isStopped) {
        throw new Error(msg || "pubsub already stopped");
    }
}

/**
 * Takes an IPubSub and wrapps it, additionally checking
 * - any channel and topic string names for validity
 * - the correct stop/start behaviour and throws exception if used after stopped
 * - makes sure only plain objects are published and optionally checks the message payload size.
 */
export class PubSubValidationWrapper implements IPubSub
{
    protected pubsub: IPubSub;

    public stringValidator: TopicChannelNameValidator;

    public enablePlainObjectCheck = true;

    public isStopped = false;

    constructor(wrappedPubSub: IPubSub) {
        this.pubsub = wrappedPubSub;
        this.stringValidator = new DefaultTopicChannelNameValidator();
    }

    setTopicChannelNameSettings(settings: DefaultTopicChannelNameValidatorSettings) {
        this.stringValidator = new DefaultTopicChannelNameValidator(settings);
    }

    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub> {
        throwIfStopped.bind(this)();
        return this.pubsub.start(callback, disconnect);
    }

    stop(callback?: IPubSubStopCallback): Promise<void> {
        this.isStopped = true;
        return this.pubsub.stop(callback);
    }

    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel> {
        throwIfStopped.bind(this)();
        if (typeof name !== 'string')
            throw new Error("Channel name must be of type string");
        if (name == "")
            throw new Error(`Channel name must be non-zerolength string`);

        this.stringValidator.validateChannelName(name);

        // VALIDATION PASSED...

        let wrappedCallback: IChannelReadyCallback;
        if (callback) {
            wrappedCallback = (chan: IChannel) => {
                const wrappedChannel = new ChannelValidated(name, chan, this);
                callback(wrappedChannel);
            };
        }
        // TODO promise chaining
        return new Promise((resolve, reject) => {
            this.pubsub.channel(name, wrappedCallback).then(chan => {
                const channel = new ChannelValidated(name, chan, this);
                resolve(channel);
            })
            // TODO reject() case
        });
    }
}

class ChannelValidated implements IChannel {

    protected wrappedChannel: IChannel;
    protected stringValidator: TopicChannelNameValidator;
    protected pubsub: PubSubValidationWrapper;
    protected enablePlainObjectCheck: boolean;

    public name: string;

    constructor(name: string, wrappedChannel: IChannel, pubsub: PubSubValidationWrapper) {
        this.name = name;
        this.wrappedChannel = wrappedChannel;
        this.pubsub = pubsub;
        this.stringValidator = pubsub.stringValidator;
        this.enablePlainObjectCheck = pubsub.enablePlainObjectCheck;
    }

    /**
     * If the users passes in an object, it must be a plain object. Strings, numbers, array etc. are ok.
     */
    private objectIsPlainObject(obj: any): boolean {
        // TODO recursive checking, all corner cases etc.
        // Use this poor-mans approach for now
        if (typeof obj == 'object' && obj.constructor != Object) {
            return false;
        } else {
            return true;
        }
    }

    setTopicChannelNameValidator(validator: TopicChannelNameValidator) {
        this.stringValidator = validator;
    }

    publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void {
        throwIfStopped.bind(this.pubsub)();
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)

        if (this.enablePlainObjectCheck && !this.objectIsPlainObject(payload)) {
            let err = new Error("only plain objects are allowed to be published");
            invokeIfDefined(callback, err);
            throw err;
        }

        this.stringValidator.validateTopicName(topic);

        return this.wrappedChannel.publish<T>(topic, payload, callback);
    }

    subscribe<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken> {
        throwIfStopped.bind(this.pubsub)();
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)
        this.stringValidator.validateTopicName(topic);
        // TODO string validation

        return this.wrappedChannel.subscribe<T>(topic, observer, callback);
    }

    once<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken> {
        throwIfStopped.bind(this.pubsub)();
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string")
        this.stringValidator.validateTopicName(topic);

        return this.wrappedChannel.once<T>(topic, observer, callback);
    }
}
