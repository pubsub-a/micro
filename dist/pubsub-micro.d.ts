import { IPubSub, IChannel, IPubSubStartCallback, IPubSubStopCallback, IChannelReadyCallback } from 'pubsub-a-interface';
import { BucketHash } from './buckethash';
export declare function invokeIfDefined(func: Function, ...args: any[]): void;
export { BucketHash } from "./buckethash";
export declare class PubSub implements IPubSub {
    private subscriptionCache;
    constructor();
    start(callback?: IPubSubStartCallback): void;
    stop(callback?: IPubSubStopCallback): void;
    channel(name: string, callback: IChannelReadyCallback): IChannel;
    static includeIn(obj: any, publish_name?: string, subscribe_name?: string): any;
    /**
     * Helper functions that expose some internals that are reused in sister projects
     */
    static BucketHash: typeof BucketHash;
    static invokeIfDefined: any;
    static SubscriptionToken: any;
    static Util: any;
}
