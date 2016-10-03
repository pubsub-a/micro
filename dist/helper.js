"use strict";
function safeDispose(token) {
    if (!token)
        throw new Error("token must be defined!");
    if (!token.isDisposed)
        token.dispose();
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