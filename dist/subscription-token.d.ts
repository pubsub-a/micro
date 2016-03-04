import { ISubscriptionToken, SubscriptionDisposedCallback, disposeFunction } from 'pubsub-a-interface';
export declare class SubscriptionToken implements ISubscriptionToken {
    isDisposed: boolean;
    count: number;
    private disposeFn;
    constructor(disposeFn: disposeFunction, count?: number);
    dispose(callback?: SubscriptionDisposedCallback): number;
}
