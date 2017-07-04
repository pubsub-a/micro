import { IPubSub, IChannel, StopReason } from 'pubsub-a-interfaces';
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
    isStarted: boolean;
    readonly onStart: Promise<void>;
    readonly onStop: Promise<"REMOTE_DISCONNECT" | "LOCAL_DISCONNECT" | "TIMEOUT" | "UNSPECIFIED_ERROR" | undefined>;
    readonly clientId: string;
    constructor(wrappedPubSub: IPubSub);
    setTopicChannelNameSettings(settings: DefaultTopicChannelNameValidatorSettings): void;
    start(onStopByExternal?: Function): Promise<IPubSub>;
    stop(reason?: StopReason): Promise<void>;
    channel(name: string): Promise<IChannel>;
}
