"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SubscriptionToken = (function () {
    function SubscriptionToken(onDispose, count) {
        this.isDisposed = false;
        this.disposeFn = onDispose;
        this.count = count ? count : 0;
    }
    SubscriptionToken.prototype.dispose = function () {
        if (this.isDisposed) {
            throw new Error('Subscription is already disposed');
        }
        this.isDisposed = true;
        return this.disposeFn();
    };
    return SubscriptionToken;
}());
exports.SubscriptionToken = SubscriptionToken;
//# sourceMappingURL=subscription-token.js.map