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
import { TopicChannelNameValidator, DefaultTopicChannelNameValidator, DefaultTopicChannelNameValidatorSettings } from "./string_validation";

export class PubSubMicro implements IPubSub
{
    protected pubsub: IPubSub;
    protected stringValidator: TopicChannelNameValidator;

    constructor(wrappedPubSub?: IPubSub) {
        if (wrappedPubSub == undefined) {
            wrappedPubSub = new PubSubMicroUnvalidated();
        }
        this.pubsub = wrappedPubSub;
        this.stringValidator = new DefaultTopicChannelNameValidator();
    }

    setTopicChannelNameSettings(settings: DefaultTopicChannelNameValidatorSettings) {
        this.stringValidator = new DefaultTopicChannelNameValidator(settings);
    }

    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub> {
        return this.pubsub.start(callback, disconnect);
    }

    stop(callback?: IPubSubStopCallback): Promise<void> {
        return this.pubsub.stop(callback);
    }

    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel> {
        if (typeof name !== 'string')
            throw new Error("Channel name must be of type string");
        if (name == "")
            throw new Error(`Channel name must be non-zerolength string`);

        this.stringValidator.validateChannelName(name);

        // VALIDATION PASSED...

        let wrappedCallback: IChannelReadyCallback;
        if (callback) {
            wrappedCallback = (chan: IChannel) => {
                const wrappedChannel = new ChannelValidated(name, chan, this.stringValidator);
                callback(wrappedChannel);
            };
        }
        // TODO promise chaining
        return new Promise((resolve, reject) => {
            this.pubsub.channel(name, wrappedCallback).then(chan => {
                const channel = new ChannelValidated(name, chan, this.stringValidator);
                resolve(channel);
            })
            // TODO reject() case
        });
    }
}

class ChannelValidated implements IChannel {

    protected wrappedChannel: IChannel;
    protected stringValidator: TopicChannelNameValidator;

    public name: string;

    constructor(name: string, wrappedChannel: IChannel, stringValidator: TopicChannelNameValidator) {
        this.name = name;
        this.wrappedChannel = wrappedChannel;
        this.stringValidator = stringValidator;
    }

    setTopicChannelNameValidator(validator: TopicChannelNameValidator) {
        this.stringValidator = validator;
    }

    publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string")
        this.stringValidator.validateTopicName(topic);

        return this.wrappedChannel.publish<T>(topic, payload, callback);
    }

    subscribe<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string")
        this.stringValidator.validateTopicName(topic);
        // TODO string validation

        return this.wrappedChannel.subscribe<T>(topic, observer, callback);
    }

    once<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string")
        this.stringValidator.validateTopicName(topic);

        return this.wrappedChannel.once<T>(topic, observer, callback);
    }
}
