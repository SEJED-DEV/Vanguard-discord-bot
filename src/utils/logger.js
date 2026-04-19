const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Global logging utility.
 * Sends logs to specific channels in the support server.
 */
class Logger {
    constructor(client) {
        this.client = client;
        this.cache = {
            guild: null,
            channels: new Map()
        };
    }

    /**
     * Internal method to send logs to the support server.
     */
    async logAction(type, embed) {
        const supportServerId = config.supportServerId;
        if (!supportServerId) return;

        const channelMap = {
            'BAN': config.logChannels.bans,
            'KICK': config.logChannels.kicks,
            'WARN': config.logChannels.warns,
            'TIMEOUT': config.logChannels.timeouts,
            'CONFIG': config.logChannels.config,
            'ERROR': config.logChannels.errors,
            'UNBAN': config.logChannels.bans,
        };

        const channelId = channelMap[type.toUpperCase()];
        if (!channelId) return;

        try {
            // Cache Guild
            if (!this.cache.guild) {
                this.cache.guild = await this.client.guilds.fetch(supportServerId).catch(() => null);
            }
            if (!this.cache.guild) return;

            // Cache Channel
            let channel = this.cache.channels.get(channelId);
            if (!channel) {
                channel = await this.cache.guild.channels.fetch(channelId).catch(() => null);
                if (channel) this.cache.channels.set(channelId, channel);
            }

            if (channel) {
                await channel.send({ embeds: [embed] }).catch(() => null);
            }
        } catch (error) {
            console.error(`Logger error (Type: ${type}):`, error);
        }
    }

    /**
     * Log a moderation action globally.
     */
    async logModeration(action, moderator, target, reason, guild) {
        // Privacy Guard: Only log to internal support server if the action 
        // occurs in a guild owned by the bot owner (Developer Monitoring).
        if (guild.ownerId !== config.ownerId) return;

        const embed = new EmbedBuilder()
            .setTitle(`${action} | ${config.botName} Internal Logs`)
            .addFields(
                { name: 'Target', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
                { name: 'Guild', value: `${guild.name} (${guild.id})`, inline: true },
                { name: 'Reason', value: reason || 'No reason provided' }
            )
            .setTimestamp()
            .setColor(this.getActionColor(action));

        await this.logAction(action.toUpperCase(), embed);
    }

    /**
     * Log an error or break.
     */
    async logError(error, context) {
        try {
            // Truncate stack trace to ensure it fits within Discord's 2000 character limit
            const errorStack = (error.stack || error).toString();
            const truncatedStack = errorStack.length > 1500 
                ? errorStack.substring(0, 1497) + '...' 
                : errorStack;

            const embed = new EmbedBuilder()
                .setTitle('Bot Error/Exception')
                .setDescription(`\`\`\`js\n${truncatedStack}\n\`\`\``)
                .addFields({ name: 'Context', value: context || 'No context' })
                .setTimestamp()
                .setColor(config.colors.error)
                .setFooter({ text: `${config.botName} System Diagnostics` });

            await this.logAction('ERROR', embed);
        } catch (fatalError) {
            console.error('[FATAL FALLBACK] Failed to send error to Discord Log Channel. Raw exception below:');
            console.error('Original Error:', error);
            console.error('Logger Failure:', fatalError);
        }
    }

    getActionColor(action) {
        const colors = {
            'BAN': config.colors.error,
            'KICK': config.colors.kick,
            'WARN': config.colors.warn,
            'TIMEOUT': config.colors.timeout,
            'CONFIG': config.colors.success,
            'UNBAN': config.colors.success,
        };
        return colors[action.toUpperCase()] || config.colors.default;
    }
}

module.exports = Logger;
