"use strict";
var DefaultTopicChannelNameValidator = (function () {
    function DefaultTopicChannelNameValidator(settings) {
        if (!settings) {
            settings = {
                channelNameMaxLength: 63,
                topicNameMaxLength: 255
            };
        }
        this.settings = settings;
    }
    /**
     * Checks if a string consists only of the characters A-z, 0-9 plus one of ": - _ /"
     */
    DefaultTopicChannelNameValidator.prototype.containsOnlyValidChars = function (name) {
        var m = name.match(/([A-z0-9_:\/\-]+)/g);
        var contains_invalid_chars = (m == null || m == undefined || m.length == 0 || m[0] !== name);
        return !contains_invalid_chars;
    };
    ;
    /**
     * Validates a channel to be between 1 and 63 characters long and consists only of
     * [A-Za-z0-9] plus the special characters: : _ - /
     */
    DefaultTopicChannelNameValidator.prototype.validateChannelName = function (name) {
        if (name.length > this.settings.channelNameMaxLength)
            throw new Error("Channel name must be between 1 and " + this.settings.channelNameMaxLength + " characters long");
        if (!this.containsOnlyValidChars(name)) {
            throw new Error("Channel name contains invalid characters");
        }
    };
    /**
     * Validates a topic name to be between 1 and topicNameMaxLength characters long and consists only
     * of [A-z0-9] plus the special characters: : _ - /
     *
     * Additionally, the reserved sequences _%_ and _$_ are allowed but should only be used
     * internally by PubSub implementations!
     */
    DefaultTopicChannelNameValidator.prototype.validateTopicName = function (name) {
        if (name.length > this.settings.topicNameMaxLength)
            throw new Error("Topic name must be between 1 and " + this.settings.topicNameMaxLength + " characters long");
        // quick return if there is no special characters
        if (this.containsOnlyValidChars(name))
            return;
        // EXCEPTION: the special sequence _$_ and _%_ are allowed
        var repl = name;
        repl = repl.replace(/_\$_/g, '');
        repl = repl.replace(/_%_/g, '');
        if (!this.containsOnlyValidChars(repl))
            throw new Error("Topic name contains unallowed character(s): " + name);
    };
    return DefaultTopicChannelNameValidator;
}());
exports.DefaultTopicChannelNameValidator = DefaultTopicChannelNameValidator;
//# sourceMappingURL=string_validation.js.map