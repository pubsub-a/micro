"use strict";
var SubscriptionToken = (function () {
    function SubscriptionToken(disposeFn, count) {
        this.isDisposed = false;
        this.disposeFn = disposeFn;
        this.count = count ? count : 0;
    }
    SubscriptionToken.prototype.dispose = function (callback) {
        if (this.isDisposed) {
            throw new Error('Subscription is already disposed');
        }
        this.isDisposed = true;
        return this.disposeFn(callback);
    };
    return SubscriptionToken;
}());
exports.SubscriptionToken = SubscriptionToken;
//# sourceMappingURL=subscription-token.js.map