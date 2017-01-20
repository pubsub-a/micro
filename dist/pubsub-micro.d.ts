import { IPubSub, IChannel, IObserverFunc, IPubSubStartCallback, IPubSubStopCallback, IChannelReadyCallback } from 'pubsub-a-interfaces';
import { BucketHash } from './buckethash';
import { PubSubValidationWrapper } from "./validation-wrapper";
export declare type SubscriptionCache = BucketHash<IObserverFunc<any>>;
export declare class PubSubMicroValidated extends PubSubValidationWrapper {
    /**
     * To allow shared/link PubSub instances (for testing)
     * expose the subscriptionCache so we can pass it to
     * other instances
     */
    readonly subscriptionCache: BucketHash<IObserverFunc<any>>;
    constructor(subscriptionCache?: SubscriptionCache);
}
export declare class PubSubMicroUnvalidated implements IPubSub {
    readonly subscriptionCache: SubscriptionCache;
    isStopped: boolean;
    isStarted: boolean;
    clientId: string;
    constructor(subscriptionCache?: SubscriptionCache);
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
}
