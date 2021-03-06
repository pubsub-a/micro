export interface ValidationOptions {
    channelNameMaxLength: number;
    topicNameMaxLength: number;

    // if we allow _%_ and _$_ in topics
    allowSpecialTopicSequences: boolean;
}

export interface NameValidator {
    validateChannelName(name: string): void;
    validateTopicName(name: string): void;
}

/**
 * Checks if a string consists only of the characters A-z, 0-9 plus one of ": - _ /"
 */
export function hasOnlyValidChars(name: string): boolean {
    const m = name.match(/([A-z0-9_:\/\-]+)/g);
    const contains_invalid_chars = m == null || m == undefined || m.length == 0 || m[0] !== name;
    return !contains_invalid_chars;
}

export class DefaultValidator implements NameValidator {
    private settings: ValidationOptions;

    constructor(settings?: ValidationOptions) {
        if (!settings) {
            settings = {
                channelNameMaxLength: 63,
                topicNameMaxLength: 255,
                allowSpecialTopicSequences: false
            };
        }
        this.settings = settings;
    }

    private containsOnlyValidChars = hasOnlyValidChars;

    /**
     * Validates a channel to be between 1 and 63 characters long and consists only of
     * [A-Za-z0-9] plus the special characters: : _ - /
     *
     */
    public validateChannelName(name: string) {
        if (name.length > this.settings.channelNameMaxLength)
            throw new Error(`Channel name must be between 1 and ${this.settings.channelNameMaxLength} characters long`);

        if (!this.containsOnlyValidChars(name)) {
            throw new Error("Channel name contains invalid characters");
        }
    }

    /**
     * Validates a topic name to be between 1 and topicNameMaxLength characters long and consists only
     * of [A-z0-9] plus the special characters: : _ - /
     *
     * Additionally, the reserved sequences _%_ and _$_ are allowed but should only be used
     * internally by PubSub implementations!
     */
    public validateTopicName(name: string) {
        if (name.length > this.settings.topicNameMaxLength)
            throw new Error(`Topic name must be between 1 and ${this.settings.topicNameMaxLength} characters long`);

        // quick return if there is no special characters
        if (this.containsOnlyValidChars(name)) return;

        // quick return to avoid regex
        if (!this.settings.allowSpecialTopicSequences)
            throw new Error(`Topic name contains unallowed character(s): ${name}`);

        // EXCEPTION: the special sequence _$_ and _%_ are allowed
        let repl = name;
        repl = repl.replace(/_\$_/g, "");
        repl = repl.replace(/_%_/g, "");
        if (!this.containsOnlyValidChars(repl)) throw new Error(`Topic name contains unallowed character(s): ${name}`);
    }
}
