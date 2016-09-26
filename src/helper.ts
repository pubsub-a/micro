import { ISubscriptionToken } from "pubsub-a-interface";

export function safeDispose(token: ISubscriptionToken): void {
    if (!token)
        throw new Error("token must be defined!");

    if (!token.isDisposed)
        token.dispose();

}

export function invokeIfDefined(func: Function | undefined | null, ...args: any[]) {
    if (func) {
        func.apply(func, args);
    }
}