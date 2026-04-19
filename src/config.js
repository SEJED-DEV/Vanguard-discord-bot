/**
 * Vanguard Configuration Loader
 * Handles environment variables and provides sensible defaults.
 */
module.exports = {
    botName: process.env.BOT_NAME || 'Vanguard',
    supportServer: process.env.SUPPORT_SERVER_LINK || 'https://discord.gg/3TJEacm6RD',
    supportServerId: process.env.SUPPORT_SERVER_ID,
    ownerId: process.env.OWNER_ID,

    logChannels: {
        bans: process.env.LOG_BANS_CHANNEL,
        kicks: process.env.LOG_KICKS_CHANNEL,
        warns: process.env.LOG_WARNS_CHANNEL,
        timeouts: process.env.LOG_TIMEOUTS_CHANNEL,
        config: process.env.LOG_CONFIG_CHANNEL,
        errors: process.env.LOG_ERRORS_CHANNEL,
    },
    
    defaults: {
        cooldown: parseInt(process.env.DEFAULT_COOLDOWN) || 3,
        databasePath: process.env.DATABASE_PATH || './vanguard.sqlite'
    },

    colors: {
        success: parseInt(process.env.COLOR_SUCCESS) || 0x00FF00,
        error: parseInt(process.env.COLOR_ERROR) || 0xFF0000,
        info: parseInt(process.env.COLOR_INFO) || 0x5865F2,
        warn: parseInt(process.env.COLOR_WARN) || 0xFFFF00,
        timeout: parseInt(process.env.COLOR_TIMEOUT) || 0x0000FF,
        kick: parseInt(process.env.COLOR_KICK) || 0xFFA500,
        default: 0x808080
    }
};
