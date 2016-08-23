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
import { PubSubMicro } from "./pubsub-micro";
import { StringValidator, StringValidationSettings } from "./string_validation";

export class PubSubMicroValidated implements IPubSub
{
    protected pubsub: IPubSub;
    protected stringValidator: StringValidator;

    constructor(wrappedPubSub?: IPubSub) {
        if (wrappedPubSub == undefined) {
            wrappedPubSub = new PubSubMicro();
        }
        this.pubsub = wrappedPubSub;
        this.stringValidator = new StringValidator();
    }

    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub> {
        return this.pubsub.start(callback, disconnect);
    }

    stop(callback?: IPubSubStopCallback): Promise<void> {
        return this.pubsub.stop(callback);
    }
    
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel> {
        // TODO automatically reject() the promise?
        this.stringValidator.validateChannelName(name);
     
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
    protected stringValidator: StringValidator;
    
    public name: string;
    
    constructor(name: string, wrappedChannel: IChannel, stringValidator: StringValidator) {
        this.name = name;
        this.wrappedChannel = wrappedChannel;
        this.stringValidator = stringValidator;
    }
    
    publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void {
        this.stringValidator.validateTopicName(topic);
        return this.wrappedChannel.publish<T>(topic, payload, callback);
    }
    
    subscribe<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken> {
        this.stringValidator.validateTopicName(topic);
        // TODO string validation
        return this.wrappedChannel.subscribe<T>(topic, observer, callback);
    }
    
    once<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken> {
        this.stringValidator.validateTopicName(topic);
        return this.wrappedChannel.once<T>(topic, observer, callback);
    }
}