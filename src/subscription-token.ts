import { ISubscriptionToken, ISubscriptionDisposedCallback } from 'pubsub-a-interfaces';
import { Promise } from "es6-promise";

export interface DisposeFunction {
    (callback?: ISubscriptionDisposedCallback): Promise<number>;
}

export class SubscriptionToken implements ISubscriptionToken {

    public isDisposed: boolean = false;
    public count: number;

    private disposeFn: Function;

    constructor(onDispose: DisposeFunction, count?: number) {
        this.disposeFn = onDispose;
        this.count = count ? count : 0;
    }

    dispose(callback?: ISubscriptionDisposedCallback): Promise<number> {
        if (this.isDisposed) {
            throw new Error('Subscription is already disposed');
        }

        this.isDisposed = true;
        return this.disposeFn(callback);
    }
}
