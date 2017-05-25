"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function safeDispose(token) {
    if (!token)
        throw new Error("token must be defined!");
    if (!token.isDisposed)
        return token.dispose();
    else
        return Promise.resolve(undefined);
}
exports.safeDispose = safeDispose;
function invokeIfDefined(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (func) {
        func.apply(func, args);
    }
}
exports.invokeIfDefined = invokeIfDefined;
//# sourceMappingURL=helper.js.map