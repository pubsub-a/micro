import { SubscriptionToken } from "@dynalon/pubsub-a-interfaces";

export function safeDispose(token: SubscriptionToken): Promise<number | undefined> {
    if (!token)
        throw new Error("token must be defined!");

    if (!token.isDisposed)
        return token.dispose();
    else
        return Promise.resolve(undefined);
}

export function invokeIfDefined(func: Function | undefined | null, ...args: any[]) {
    if (func) {
        func.apply(func, args);
    }
}