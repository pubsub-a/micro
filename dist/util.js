"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function randomString(length) {
    if (length === void 0) { length = 8; }
    var text = '';
    var allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++)
        text += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));
    return text;
}
exports.randomString = randomString;
//# sourceMappingURL=util.js.map