/**
 * Checks if a string consists only of the characters A-z, 0-9 plus one of ": - _ /"
 */

function containsOnlyValidChars(name: string): boolean {
    const m = name.match(/([A-z0-9_:\/\-]+)/g);
    const contains_invalid_chars = (m == null || m == undefined || m.length == 0 || m[0] !== name);
    return !contains_invalid_chars;
};

/**
 * Validates a channel to be between 1 and 63 characters long and consists only of
 * [A-Za-z0-9] plus the special characters: : _ - /
 */
export function validateChannelName(name: string) {
    if (typeof name !== 'string')
        throw new Error("Channel name must be of type string");
    if (!name || name.length > 63)
        throw new Error("Channel name must be between 1 and 63 characters long");

    if (!containsOnlyValidChars(name)) {
        throw new Error("Channel name contains invalid characters")
    }
}

/**
 * Validates a topic name to be between 1 and 255 characters long and consists only
 * of [A-z0-9] plus the special characters: : _ - /
 *
 * Additionally, the reserved sequences _%_ and _$_ are allowed but should only be used
 * internally by PubSub implementations!
 */
export function validateTopicName(name: string) {
    if (typeof name !== 'string')
        throw new Error("Topic name must be of type string");
    if (!name || name.length > 255)
        throw new Error("Topic name must be between 1 and 255 characters long");

    // quick return if there is no special characters
    if (containsOnlyValidChars(name))
        return;
    else {
        // EXCEPTION: the special sequence _$_ and _%_ are allowed
        let repl = name;
        repl = repl.replace(/_\$_/g, '');
        repl = repl.replace(/_%_/g, '');
        if (!containsOnlyValidChars(repl)) {
            throw new Error("Topic name contains unallowed character(s)");
        }
    }
}
