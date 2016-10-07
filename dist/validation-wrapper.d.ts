import { IPubSub, IChannel, IPubSubStartCallback, IPubSubStopCallback, IChannelReadyCallback } from 'pubsub-a-interfaces';
import { Promise } from "es6-promise";
import { TopicChannelNameValidator, DefaultTopicChannelNameValidatorSettings } from "./string-validation";
/**
 * Takes an IPubSub and wrapps it, additionally checking
 * - any channel and topic string names for validity
 * - the correct stop/start behaviour and throws exception if used after stopped
 * - makes sure only plain objects are published and optionally checks the message payload size.
 */
export declare class PubSubValidationWrapper implements IPubSub {
    protected pubsub: IPubSub;
    stringValidator: TopicChannelNameValidator;
    enablePlainObjectCheck: boolean;
    isStopped: boolean;
    constructor(wrappedPubSub: IPubSub);
    setTopicChannelNameSettings(settings: DefaultTopicChannelNameValidatorSettings): void;
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
}
