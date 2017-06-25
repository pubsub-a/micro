import {
    IPubSub,
    IChannel,
    ISubscriptionToken,
    IObserverFunc,
} from 'pubsub-a-interfaces';

import { PubSubMicroUnvalidated } from "./pubsub-micro";
import { TopicChannelNameValidator, DefaultTopicChannelNameValidator, DefaultTopicChannelNameValidatorSettings } from "./string-validation";
import { invokeIfDefined } from "./helper";

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
    public isStarted = false;

    public get clientId(): string {
        return this.pubsub.clientId;
    }

    constructor(wrappedPubSub: IPubSub) {
        this.pubsub = wrappedPubSub;
        this.stringValidator = new DefaultTopicChannelNameValidator();
    }

    setTopicChannelNameSettings(settings: DefaultTopicChannelNameValidatorSettings) {
        this.stringValidator = new DefaultTopicChannelNameValidator(settings);
    }

    start(onStopByExternal?: Function): Promise<IPubSub> {
        if (this.isStopped) {
            const err = "Already stopped, can't restart. You need to create a new instance";
            return Promise.reject(err);
        }

        if (this.isStarted == true) {
            const err = "Already started, can't start a second time.";
            throw new Error(err);
        } else {
            this.isStarted = true;
        }

        return this.pubsub.start(onStopByExternal);
    }

    stop(): Promise<void> {
        this.isStopped = true;
        return this.pubsub.stop();
    }

    channel(name: string): Promise<IChannel> {
        if (this.isStopped) {
            const err = "Instance is stopped";
            return Promise.reject(new Error(err));
        }

        if (typeof name !== 'string')
            throw new Error("Channel name must be of type string");
        if (name == "")
            throw new Error(`Channel name must be non-zerolength string`);

        this.stringValidator.validateChannelName(name);

        // VALIDATION PASSED...

        return this.pubsub.channel(name).then(chan => {
            return new ChannelValidated(name, chan, this);
        });
    }
}

class ChannelValidated implements IChannel {

    protected wrappedChannel: IChannel;

    protected get stringValidator(): TopicChannelNameValidator {
        return this.pubsub.stringValidator;
    }

    protected pubsub: PubSubValidationWrapper;
    protected enablePlainObjectCheck: boolean;

    public name: string;

    constructor(name: string, wrappedChannel: IChannel, pubsub: PubSubValidationWrapper) {
        this.name = name;
        this.wrappedChannel = wrappedChannel;
        this.pubsub = pubsub;
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

    publish<T>(topic: string, payload: T): Promise<any> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)

        if (this.enablePlainObjectCheck && !this.objectIsPlainObject(payload)) {
            let err = new Error("only plain objects are allowed to be published");
            throw err;
        }

        if (this.pubsub.isStopped) {
            const err = new Error(`publish after pubsub instance has stopped, encountered when publishing on topic: ${topic}`);
            return Promise.reject(err);
        }

        this.stringValidator.validateTopicName(topic);

        return this.wrappedChannel.publish<T>(topic, payload);
    }

    subscribe<T>(topic: string, observer: IObserverFunc<T>): Promise<ISubscriptionToken> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)
        this.stringValidator.validateTopicName(topic);

        if (this.pubsub.isStopped) {
            const err = new Error(`subscribe after pubsub instance has stopped, topic was: ${topic}`);
            return Promise.reject(err);
        }

        return this.wrappedChannel.subscribe<T>(topic, observer);
    }

    once<T>(topic: string, observer: IObserverFunc<T>): Promise<ISubscriptionToken> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string")
        this.stringValidator.validateTopicName(topic);

        return this.wrappedChannel.once<T>(topic, observer);
    }
}
