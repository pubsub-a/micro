import { ISubscriptionToken } from 'pubsub-a-interfaces';
export interface IDisposeFunction {
    (): Promise<number>;
}
export declare class SubscriptionToken implements ISubscriptionToken {
    isDisposed: boolean;
    count: number;
    private disposeFn;
    constructor(onDispose: IDisposeFunction, count?: number);
    dispose(): Promise<number>;
}
