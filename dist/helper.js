"use strict";
var es6_promise_1 = require("es6-promise");
function safeDispose(token) {
    if (!token)
        throw new Error("token must be defined!");
    if (!token.isDisposed)
        return token.dispose();
    else
        return es6_promise_1.Promise.resolve(undefined);
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