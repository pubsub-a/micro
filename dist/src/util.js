var Util = (function () {
    function Util() {
    }
    Util.randomString = function (length) {
        if (length === void 0) { length = 8; }
        var text = '';
        var allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < length; i++)
            text += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));
        return text;
    };
    return Util;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Util;
