import { ISubscriptionToken } from "pubsub-a-interfaces";
export declare function safeDispose(token: ISubscriptionToken): Promise<number | undefined>;
export declare function invokeIfDefined(func: Function | undefined | null, ...args: any[]): void;
