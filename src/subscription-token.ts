import { SubscriptionToken as ISubscriptionToken } from '@dynalon/pubsub-a-interfaces';

export interface AsyncDisposeFunction {
    // can be number | undefined or any other type; if !== number we will map it to undefined
    (): Promise<any>;
}

export class SubscriptionToken implements ISubscriptionToken {

    public isDisposed: boolean = false;

    /**
     * The count represents the number of subscriptions at the time of subscribing and is not changed later on
     */
    public readonly count: number;

    private readonly disposeFn: AsyncDisposeFunction;

    /**
     * The count returned by the .dispose() function which we cache for further calls to dispose()
     */
    private countOnDispose: number | undefined;

    constructor(onDispose: AsyncDisposeFunction, count?: number) {
        this.disposeFn = onDispose;
        this.count = count ? count : 0;
    }

    dispose(): Promise<number | undefined> {
        if (this.isDisposed) {
            return Promise.resolve(this.countOnDispose);
        }

        this.isDisposed = true;
        return this.disposeFn().then(count => {
            const countOnDispose = typeof count === 'number' ? count : undefined;
            this.countOnDispose = countOnDispose;
            return countOnDispose;
        })
    }
}
