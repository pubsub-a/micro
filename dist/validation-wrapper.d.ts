import { IPubSub, IChannel, IPubSubStartCallback, IPubSubStopCallback, IChannelReadyCallback } from 'pubsub-a-interface';
import { Promise } from "es6-promise";
import { TopicChannelNameValidator, DefaultTopicChannelNameValidatorSettings } from "./string-validation";
/**
 * Takes an IPubSub and wrapps it, additionally checking any channel and topic string names for validity.
 */
export declare class PubSubValidationWrapper implements IPubSub {
    protected pubsub: IPubSub;
    protected stringValidator: TopicChannelNameValidator;
    constructor(wrappedPubSub: IPubSub);
    setTopicChannelNameSettings(settings: DefaultTopicChannelNameValidatorSettings): void;
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
}
