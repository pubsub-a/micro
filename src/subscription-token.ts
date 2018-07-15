import { SubscriptionToken as ISubscriptionToken } from '@dynalon/pubsub-a-interfaces';

export interface AsyncDisposeFunction {
    // can be number | undefined or any other type; if !== number we will map it to undefined
    (): Promise<any>;
}

export class SubscriptionToken implements ISubscriptionToken {

    public isDisposed: boolean = false;
    public count: number;

    private disposeFn: AsyncDisposeFunction;

    constructor(onDispose: AsyncDisposeFunction, count?: number) {
        this.disposeFn = onDispose;
        this.count = count ? count : 0;
    }

    dispose(): Promise<number | undefined> {
        if (this.isDisposed) {
            return Promise.resolve(0);
        }

        this.isDisposed = true;
        return this.disposeFn().then(count => typeof count === 'number' ? count : undefined)
    }
}
