module PubSub {

  interface disposeFunction {
    (SubscriptionDisposedCallback): number;
  }

  export class SubscriptionToken implements ISubscriptionToken {

    public isDisposed: boolean = false;
    public count: number;

    private disposeFn: disposeFunction;

    constructor (disposeFn: disposeFunction, count?: number) {
      this.disposeFn = disposeFn;
      this.count = count ? count : 0;
    }

    dispose (callback?: SubscriptionDisposedCallback) {
      if (this.isDisposed) {
        throw new Error ('Subscription is already disposed');
      }

      this.isDisposed = true;
      return this.disposeFn(callback);
    }
  }
}