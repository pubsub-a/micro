declare module PubSubA {
    interface IBucketHash<T> {
        add(key: string, item: T): number;
        remove(key: string, item: T): number;
        get(key: string): Array<T>;
        exists(key: string): boolean;
    }
    class BucketHash<T> implements IBucketHash<T> {
        private dict;
        private encodeKey(key);
        add(key: string, item: T): number;
        get(key: string): Array<T>;
        exists(key: string): boolean;
        clear(key: string): void;
        /**
        @returns The number of items in the bucket for this key
        */
        remove(key: string, item?: T): number;
        private removeFromArray(arr, item);
    }
}

declare module PubSubA.InternalInterfaces {
    interface IPublisher<T> {
        publish(obj: T, callback?: Function): void;
    }
    interface ISubscriber<T> {
        subscribe(fn: ISubscriptionFunc<T>, callback?: Function): ISubscriptionToken;
    }
}

declare module PubSubA {
    function internalIncludeIn(obj: Object, publishName?: string, subscribeName?: string): Object;
}

declare module PubSubA {
    function addProvider(name: string, ctor: Function): void;
    function create(name: string, options?: any): IPubSub;
    function getProvider(): any[];
}

declare module PubSubA {
    function invokeIfDefined(func: Function, ...args: any[]): void;
    class ChannelStatic {
        publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void;
        subscribe<T>(topic: string, subscription: ISubscriptionFunc<T>, callback?: Function): ISubscriptionToken;
        once<T>(topic: string, subscription: ISubscriptionFunc<T>, callback?: Function): ISubscriptionToken;
    }
    class MicroPubSub implements IPubSub {
        private subscriptionCache;
        constructor();
        start(callback?: IPubSubStartCallback): void;
        stop(callback?: IPubSubStopCallback): void;
        channel(name: string, callback: IChannelReadyCallback): IChannel;
        static includeIn(obj: any, publish_name?: string, subscribe_name?: string): any;
    }
}

declare module PubSubA {
    class SubscriptionToken implements ISubscriptionToken {
        isDisposed: boolean;
        count: number;
        private disposeFn;
        constructor(disposeFn: disposeFunction, count?: number);
        dispose(callback?: SubscriptionDisposedCallback): number;
    }
}

declare module PubSubA {
    class Util {
        static randomString(length?: number): string;
    }
}
