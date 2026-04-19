const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/index');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Display all moderation cases against a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to check logs for').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const cases = db.getUserCases(interaction.guild.id, target.id);

        if (cases.length === 0) {
            return interaction.reply({ content: `${emojis.get('info', interaction.guildId)} No moderation cases found for **${target.tag}**.`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${emojis.get('logs', interaction.guildId)} Moderation History | ${target.tag}`)
            .setColor(config.colors.info)
            .setThumbnail(target.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: `${config.botName} Moderation` });

        // Limit to last 10 cases to avoid embed limits, but inform if there are more
        const displayedCases = cases.slice(0, 10);
        const caseList = displayedCases.map(c => {
            return `**#${c.caseNumber} [${c.type}]**\nModerator: <@${c.moderatorId}>\nReason: ${c.reason}\nDate: <t:${Math.floor(new Date(c.timestamp).getTime() / 1000)}:R>`;
        }).join('\n\n');

        embed.setDescription(caseList);

        if (cases.length > 10) {
            embed.setFooter({ text: `Showing 10 of ${cases.length} cases | ${config.botName}` });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
