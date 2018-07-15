import { SubscriptionToken as ISubscriptionToken } from '@dynalon/pubsub-a-interfaces';

export interface IDisposeFunction {
    (): Promise<any>;
}

export class SubscriptionToken implements ISubscriptionToken {

    public isDisposed: boolean = false;

    private disposeFn: IDisposeFunction;

    constructor(onDispose: IDisposeFunction, count?: number) {
        this.disposeFn = onDispose;
    }

    dispose(): Promise<void> {
        if (this.isDisposed) {
            return Promise.resolve();
        }

        this.isDisposed = true;
        return this.disposeFn();
    }
}
