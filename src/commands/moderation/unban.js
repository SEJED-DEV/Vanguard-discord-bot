const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server by ID.')
        .addStringOption(option => option.setName('userid').setDescription('The ID of the user to unban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the unban').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        try {
            await interaction.guild.members.unban(userId, reason);

            const newCase = await mod.createCase(interaction.guild.id, userId, interaction.user.id, 'UNBAN', reason);

            const successEmbed = new EmbedBuilder()
                .setTitle(`${emojis.get('success', interaction.guildId)} User Unbanned`)
                .setDescription(`User ID \`${userId}\` has been unbanned.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case', value: `#${newCase.caseNumber}`, inline: true }
                )
                .setColor(config.colors.success)
                .setTimestamp()
                .setFooter({ text: `${config.botName} Moderation` });

            await interaction.reply({ embeds: [successEmbed] });

            await interaction.client.logger.logModeration('UNBAN', interaction.user, { id: userId, tag: userId }, reason, interaction.guild);
            await mod.logToGuild(interaction.guild, successEmbed);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `${emojis.get('error', interaction.guildId)} Failed to unban user. User may not be banned or ID is invalid.`, ephemeral: true });
        }
    },
};
