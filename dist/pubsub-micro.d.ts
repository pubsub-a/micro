import { IPubSub, IChannel, IObserverFunc, IPubSubStartCallback, IPubSubStopCallback, IChannelReadyCallback } from 'pubsub-a-interfaces';
import { BucketHash } from './buckethash';
import { PubSubValidationWrapper } from "./validation-wrapper";
export declare class PubSubMicroValidated extends PubSubValidationWrapper {
    constructor();
}
export declare class PubSubMicroUnvalidated implements IPubSub {
    readonly subscriptionCache: BucketHash<IObserverFunc<any>>;
    isStopped: boolean;
    clientId: string;
    constructor();
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
}
