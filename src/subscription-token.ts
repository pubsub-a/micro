import { SubscriptionToken as ISubscriptionToken } from '@dynalon/pubsub-a-interfaces';

export interface IDisposeFunction {
    (): Promise<number | undefined>;
}

export class SubscriptionToken implements ISubscriptionToken {

    public isDisposed: boolean = false;
    public count: number;

    private disposeFn: IDisposeFunction;

    constructor(onDispose: IDisposeFunction, count?: number) {
        this.disposeFn = onDispose;
        this.count = count ? count : 0;
    }

    dispose(): Promise<number | undefined> {
        if (this.isDisposed) {
            return Promise.resolve(0);
        }

        this.isDisposed = true;
        return this.disposeFn();
    }
}
