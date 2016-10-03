import { ISubscriptionToken } from "pubsub-a-interface";
export declare function safeDispose(token: ISubscriptionToken): void;
export declare function invokeIfDefined(func: Function | undefined | null, ...args: any[]): void;
