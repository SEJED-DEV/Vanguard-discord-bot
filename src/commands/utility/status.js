const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/index');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check the bot status and shard information.'),
    async execute(interaction) {
        const shardId = interaction.client.shard ? interaction.client.shard.ids[0] : 0;
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const embed = new EmbedBuilder()
            .setTitle(`${emojis.get('status_online')} ${config.botName} Status`)
            .addFields(
                { name: 'Shard', value: `\`${shardId}\``, inline: true },
                { name: 'Uptime', value: `\`${hours}h ${minutes}m\``, inline: true },
                { name: 'API Latency', value: `\`${Math.round(interaction.client.ws.ping)}ms\``, inline: true },
                { name: 'Memory Usage', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true }
            )
            .setColor(config.colors.success)
            .setTimestamp()
            .setFooter({ text: `${config.botName} | Shard Info` });

        await interaction.reply({ embeds: [embed] });
    },
};
