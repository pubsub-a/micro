export interface DefaultTopicChannelNameValidatorSettings {
    channelNameMaxLength: number;
    topicNameMaxLength: number;
}
export interface TopicChannelNameValidator {
    validateChannelName(name: string): void;
    validateTopicName(name: string): void;
}
export declare class DefaultTopicChannelNameValidator implements TopicChannelNameValidator {
    private settings;
    constructor(settings?: DefaultTopicChannelNameValidatorSettings);
    /**
     * Checks if a string consists only of the characters A-z, 0-9 plus one of ": - _ /"
     */
    private containsOnlyValidChars(name);
    /**
     * Validates a channel to be between 1 and 63 characters long and consists only of
     * [A-Za-z0-9] plus the special characters: : _ - /
     */
    validateChannelName(name: string): void;
    /**
     * Validates a topic name to be between 1 and topicNameMaxLength characters long and consists only
     * of [A-z0-9] plus the special characters: : _ - /
     *
     * Additionally, the reserved sequences _%_ and _$_ are allowed but should only be used
     * internally by PubSub implementations!
     */
    validateTopicName(name: string): void;
}
