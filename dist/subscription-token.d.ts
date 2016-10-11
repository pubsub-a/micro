import { ISubscriptionToken, ISubscriptionDisposedCallback } from 'pubsub-a-interfaces';
export interface IDisposeFunction {
    (callback?: ISubscriptionDisposedCallback): Promise<number>;
}
export declare class SubscriptionToken implements ISubscriptionToken {
    isDisposed: boolean;
    count: number;
    private disposeFn;
    constructor(onDispose: IDisposeFunction, count?: number);
    dispose(callback?: ISubscriptionDisposedCallback): Promise<number>;
}
