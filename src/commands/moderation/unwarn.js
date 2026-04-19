const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Note that a user has been cleared of warnings.')
        .addUserOption(option => option.setName('user').setDescription('The user to unwarn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the unwarn').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Warnings cleared/pardoned';
        
        try {
            const newCase = await mod.createCase(interaction.guild.id, target.id, interaction.user.id, 'UNWARN', reason);

            const successEmbed = new EmbedBuilder()
                .setTitle(`${emojis.get('success', interaction.guildId)} Warnings Cleared`)
                .setDescription(`**${target.tag}** has been unwarned.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case', value: `#${newCase.caseNumber}`, inline: true }
                )
                .setColor(config.colors.success)
                .setTimestamp()
                .setFooter({ text: `${config.botName} Moderation` });

            await interaction.reply({ embeds: [successEmbed] });

            await interaction.client.logger.logModeration('UNWARN', interaction.user, target, reason, interaction.guild);
            await mod.logToGuild(interaction.guild, successEmbed);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `${emojis.get('error', interaction.guildId)} Failed to clear warnings.`, ephemeral: true });
        }
    },
};
