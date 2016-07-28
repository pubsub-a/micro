/// <reference types="es6-promise" />
import { IPubSub, IChannel, IPubSubStartCallback, IPubSubStopCallback, IChannelReadyCallback } from 'pubsub-a-interface';
import { BucketHash } from './buckethash';
export declare function invokeIfDefined(func: Function | undefined | null, ...args: any[]): void;
export { BucketHash } from "./buckethash";
export declare function validateChannelOrTopicName(name: string): void;
export declare class PubSub implements IPubSub {
    private subscriptionCache;
    constructor();
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    /**
     * Validates a channel to be between 1 and 255 characters long and consists only of
     * [A-Za-z0-9] plus the special characters: : _ - /
     *
     */
    private validateChannelName(name);
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
    static includeIn(obj: any, publish_name?: string, subscribe_name?: string): any;
    /**
     * Helper functions that expose some internals that are reused in sister projects
     */
    static BucketHash: typeof BucketHash;
    static invokeIfDefined: any;
    static SubscriptionToken: any;
    static Util: any;
}
