const Database = require('better-sqlite3');
const path = require('node:path');
const config = require('../config');

const db = new Database(path.join(process.cwd(), config.defaults.databasePath));

// In-Memory Cache for Guild Configs with a basic size limit (Simple LRU)
const cacheSizeLimit = 1000;
const configCache = new Map();

function setCachedConfig(guildId, data) {
    if (configCache.size >= cacheSizeLimit) {
        // Remove first entry (oldest) if limit reached
        const firstKey = configCache.keys().next().value;
        configCache.delete(firstKey);
    }
    configCache.set(guildId, data);
}

// Create Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS guild_configs (
        guildId TEXT PRIMARY KEY,
        logChannelId TEXT,
        adminRoles TEXT,
        modRoles TEXT,
        mutedRoleId TEXT,
        autoModEnabled INTEGER DEFAULT 0,
        emojiMapping TEXT DEFAULT '{}',
        premium INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        moderatorId TEXT NOT NULL,
        type TEXT NOT NULL,
        reason TEXT DEFAULT 'No reason provided',
        caseNumber INTEGER NOT NULL,
        duration TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_cases_guild_user ON cases(guildId, userId);
    CREATE INDEX IF NOT EXISTS idx_cases_guild_number ON cases(guildId, caseNumber);
`);

/**
 * Database utility for SQLite operations.
 */
const dbHandler = {
    // Guild Configs
    getGuildConfig: (guildId) => {
        try {
            // Check Cache
            if (configCache.has(guildId)) {
                const cachedData = configCache.get(guildId);
                configCache.delete(guildId);
                configCache.set(guildId, cachedData);
                return cachedData;
            }

            const stmt = db.prepare('SELECT * FROM guild_configs WHERE guildId = ?');
            const result = stmt.get(guildId);
            
            if (result) {
                // Parse emojiMapping if it's a string
                if (typeof result.emojiMapping === 'string') {
                    try { result.emojiMapping = JSON.parse(result.emojiMapping); } catch { result.emojiMapping = {}; }
                }
                setCachedConfig(guildId, result);
            }
            return result;
        } catch (error) {
            console.error(`Database Error (getGuildConfig):`, error);
            return null;
        }
    },
    updateGuildConfigField: (guildId, field, value) => {
        // Security: Whitelist allowed fields to prevent SQL injection
        const allowedFields = ['logChannelId', 'adminRoles', 'modRoles', 'mutedRoleId', 'autoModEnabled', 'emojiMapping', 'premium'];
        if (!allowedFields.includes(field)) {
            console.error(`Security Warning: Unauthorized field update attempt: ${field}`);
            return null;
        }

        try {
            const stmt = db.prepare(`
                INSERT INTO guild_configs (guildId, ${field})
                VALUES (?, ?)
                ON CONFLICT(guildId) DO UPDATE SET ${field} = excluded.${field}
            `);
            const result = stmt.run(guildId, typeof value === 'object' ? JSON.stringify(value) : value);
            
            // Invalidate Cache
            configCache.delete(guildId);
            return result;
        } catch (error) {
            console.error(`Database Error (updateGuildConfigField):`, error);
            return null;
        }
    },
    updateGuildConfig: (guildId, data) => {
        try {
            const { logChannelId, adminRoles, modRoles, mutedRoleId, autoModEnabled, emojiMapping, premium } = data;
            
            const mappingString = typeof emojiMapping === 'object' ? JSON.stringify(emojiMapping) : (emojiMapping || '{}');

            const stmt = db.prepare(`
                INSERT INTO guild_configs (guildId, logChannelId, adminRoles, modRoles, mutedRoleId, autoModEnabled, emojiMapping, premium)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(guildId) DO UPDATE SET
                    logChannelId = excluded.logChannelId,
                    adminRoles = excluded.adminRoles,
                    modRoles = excluded.modRoles,
                    mutedRoleId = excluded.mutedRoleId,
                    autoModEnabled = excluded.autoModEnabled,
                    emojiMapping = excluded.emojiMapping,
                    premium = excluded.premium
            `);
            const result = stmt.run(guildId, logChannelId, adminRoles, modRoles, mutedRoleId, autoModEnabled, mappingString, premium);
            
            // Invalidate Cache
            configCache.delete(guildId);
            return result;
        } catch (error) {
            console.error(`Database Error (updateGuildConfig):`, error);
            return null;
        }
    },


    // Cases
    createCase: (guildId, userId, moderatorId, type, reason, duration = null) => {
        const transaction = db.transaction(() => {
            const stmt = db.prepare(`
                INSERT INTO cases (guildId, userId, moderatorId, type, reason, caseNumber, duration)
                VALUES (?, ?, ?, ?, ?, (SELECT IFNULL(MAX(caseNumber), 0) + 1 FROM cases WHERE guildId = ?), ?)
            `);
            return stmt.run(guildId, userId, moderatorId, type, reason, guildId, duration);
        });

        try {
            return transaction();
        } catch (error) {
            console.error(`Database Error (createCase):`, error);
            return null;
        }
    },
    getUserCases: (guildId, userId) => {
        try {
            const stmt = db.prepare('SELECT * FROM cases WHERE guildId = ? AND userId = ? ORDER BY timestamp DESC');
            return stmt.all(guildId, userId);
        } catch (error) {
            console.error(`Database Error (getUserCases):`, error);
            return [];
        }
    },
    getCaseByRowId: (rowId) => {
        try {
            const stmt = db.prepare('SELECT * FROM cases WHERE id = ?');
            return stmt.get(rowId);
        } catch (error) {
            console.error(`Database Error (getCaseByRowId):`, error);
            return null;
        }
    }
};

module.exports = dbHandler;
