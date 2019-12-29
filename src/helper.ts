export function invokeIfDefined(func: Function | undefined | null, ...args: any[]) {
    if (func) {
        func.apply(func, args);
    }
}
