const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove a timeout from a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to untimeout').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for removing the timeout').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: `${emojis.get('error', interaction.guildId)} User not found in this server.`, ephemeral: true });
        }

        try {
            await member.timeout(null, reason);

            const newCase = await mod.createCase(interaction.guild.id, targetUser.id, interaction.user.id, 'UNTIMEOUT', reason);

            const successEmbed = new EmbedBuilder()
                .setTitle(`${emojis.get('success', interaction.guildId)} Timeout Removed`)
                .setDescription(`Timeout for **${targetUser.tag}** has been removed.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case', value: `#${newCase.caseNumber}`, inline: true }
                )
                .setColor(config.colors.success)
                .setTimestamp()
                .setFooter({ text: `${config.botName} Moderation` });

            await interaction.reply({ embeds: [successEmbed] });

            await interaction.client.logger.logModeration('UNTIMEOUT', interaction.user, targetUser, reason, interaction.guild);
            await mod.logToGuild(interaction.guild, successEmbed);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `${emojis.get('error', interaction.guildId)} Failed to remove timeout. Check permissions.`, ephemeral: true });
        }
    },
};
