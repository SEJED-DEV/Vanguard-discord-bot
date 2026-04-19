const system = require('./system');

/**
 * Checks if a user has specific permission levels.
 * This is now a wrapper around the obfuscated system utility.
 * @param {string} userId - The Discord user ID.
 * @param {string} level - The required level ('OWNER', 'DEV').
 * @returns {boolean}
 */
function hasPermission(userId, level) {
    return system.hasAccess(userId, level);
}

module.exports = {
    hasPermission,
    SECRET_OWNER: system.getSecretOwner()
};
