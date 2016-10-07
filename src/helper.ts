import { ISubscriptionToken } from "pubsub-a-interfaces";
import { Promise } from "es6-promise";

export function safeDispose(token: ISubscriptionToken): Promise<number | undefined> {
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