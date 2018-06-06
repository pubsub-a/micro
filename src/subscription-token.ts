import { SubscriptionToken } from '@dynalon/pubsub-a-interfaces';

export interface IDisposeFunction {
    (): Promise<number>;
}

export class SubscriptionTokenImpl implements SubscriptionToken {

    public isDisposed: boolean = false;
    public count: number;

    private disposeFn: IDisposeFunction;

    constructor(onDispose: IDisposeFunction, count?: number) {
        this.disposeFn = onDispose;
        this.count = count ? count : 0;
    }

    dispose(): Promise<number> {
        if (this.isDisposed) {
            throw new Error('Subscription is already disposed');
        }

        this.isDisposed = true;
        return this.disposeFn();
    }
}
