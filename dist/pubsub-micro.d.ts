import { IPubSub, IChannel, IPubSubStartCallback, IPubSubStopCallback, IChannelReadyCallback } from 'pubsub-a-interface';
import { Promise } from "es6-promise";
import { PubSubValidationWrapper } from "./validation-wrapper";
export declare class PubSubMicroValidated extends PubSubValidationWrapper {
    constructor();
}
export declare class PubSubMicroUnvalidated implements IPubSub {
    private subscriptionCache;
    constructor();
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
    static includeIn(obj: any, publish_name?: string, subscribe_name?: string): any;
}
