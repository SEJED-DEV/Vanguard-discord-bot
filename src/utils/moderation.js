const db = require('../database/index');
const { EmbedBuilder } = require('discord.js');

/**
 * Moderation utility for atomic operations using SQLite.
 */
class ModerationHelper {
    /**
     * Creates a new case and persists it to SQLite.
     */
    static async createCase(guildId, userId, moderatorId, type, reason, duration = null) {
        const result = db.createCase(guildId, userId, moderatorId, type, reason, duration);
        if (!result) return { caseNumber: '???' };

        // Fetch the specific case using the exact rowid to avoid race conditions
        return db.getCaseByRowId(result.lastInsertRowid);
    }

    /**
     * Sends an embed to the guild's local log channel.
     */
    static async logToGuild(guild, embed) {
        const config = db.getGuildConfig(guild.id);
        if (!config || !config.logChannelId) return;

        try {
            const channel = await guild.channels.fetch(config.logChannelId).catch(() => null);
            if (!channel) return;

            // Check permissions before sending
            const permissions = channel.permissionsFor(guild.members.me);
            if (!permissions || !permissions.has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
                return console.warn(`[PERMISSIONS] Missing log permissions in guild ${guild.id} (Channel: ${channel.id})`);
            }

            await channel.send({ embeds: [embed] }).catch(() => null);
        } catch (err) {
            console.error(`Failed to log to guild ${guild.id}:`, err);
        }
    }

    /**
     * Safely attempts to DM a user before a moderation action.
     */
    static async sendDM(user, guild, action, reason, duration = null) {
        const embed = new EmbedBuilder()
            .setTitle(`Notification | ${guild.name}`)
            .setDescription(`You have been **${action}** from **${guild.name}**.`)
            .addFields({ name: 'Reason', value: reason })
            .setColor(0xFF0000)
            .setTimestamp();

        if (duration) {
            embed.addFields({ name: 'Duration', value: duration });
        }

        try {
            await user.send({ embeds: [embed] });
            return true;
        } catch (err) {
            return false;
        }
    }
}

module.exports = ModerationHelper;
