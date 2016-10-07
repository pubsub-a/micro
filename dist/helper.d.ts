import { ISubscriptionToken } from "pubsub-a-interface";
import { Promise } from "es6-promise";
export declare function safeDispose(token: ISubscriptionToken): Promise<number | undefined>;
export declare function invokeIfDefined(func: Function | undefined | null, ...args: any[]): void;
