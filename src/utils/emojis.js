const db = require('../database/index');

/**
 * Emoji management utility.
 * Maps human-readable keys to custom emoji IDs per-guild.
 */
class EmojiManager {
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
     * Returns the emoji for a key or a fallback.
     * @param {string} key 
     * @param {string} [guildId]
     * @returns {string}
     */
    get(key, guildId = null) {
        if (!guildId) return `[${key.toUpperCase()}]`;

        const config = db.getGuildConfig(guildId);
        const mapping = config?.emojiMapping || {};

        return mapping[key] || `[${key.toUpperCase()}]`;
    }
}

module.exports = new EmojiManager();
