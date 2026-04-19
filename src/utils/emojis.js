/**
 * Emoji management utility.
 * Maps human-readable keys to custom emoji IDs.
 */
class EmojiManager {
    constructor() {
        // This will be populated from the configuration/database
        this.emojis = {};
    }

    /**
     * Required emoji keys for the bot's branding.
     */
    static get REQUIRED_KEYS() {
        return [
            'success',
            'error',
            'warning',
            'info',
            'ban',
            'kick',
            'timeout',
            'warn',
            'logs',
            'status_online',
            'status_offline',
            'loading',
            'arrow'
        ];
    }

    /**
     * Map a key to a specific emoji string/ID.
     * @param {Object} mapping - Object containing key: id/string
     */
    setup(mapping) {
        this.emojis = mapping;
    }

    /**
     * Returns the emoji for a key or a fallback.
     * @param {string} key 
     * @returns {string}
     */
    get(key) {
        return this.emojis[key] || `[${key.toUpperCase()}]`;
    }
}

module.exports = new EmojiManager();
