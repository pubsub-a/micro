import { ISubscriptionToken, ISubscriptionDisposedCallback } from 'pubsub-a-interface';
import { Promise } from "es6-promise";
export interface DisposeFunction {
    (callback?: ISubscriptionDisposedCallback): Promise<number>;
}
export declare class SubscriptionToken implements ISubscriptionToken {
    isDisposed: boolean;
    count: number;
    private disposeFn;
    constructor(onDispose: DisposeFunction, count?: number);
    dispose(callback?: ISubscriptionDisposedCallback): Promise<number>;
}
