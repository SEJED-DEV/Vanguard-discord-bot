const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user and log it in their history.')
        .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        await interaction.deferReply({ ephemeral: true });

        try {
            // Create Case first to get number
            const newCase = await mod.createCase(interaction.guild.id, target.id, interaction.user.id, 'WARN', reason);

            // Attempt DM with CASE number
            await mod.sendDM(target, interaction.guild, `WARNED (Case #${newCase.caseNumber})`, reason);

            const successEmbed = new EmbedBuilder()
                .setTitle(`${emojis.get('warn')} User Warned`)
                .setDescription(`**${target.tag}** has been warned.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case', value: `#${newCase.caseNumber}`, inline: true }
                )
                .setColor(config.colors.warn)
                .setTimestamp()
                .setFooter({ text: `${config.botName} Moderation` });

            await interaction.editReply({ embeds: [successEmbed] });

            await interaction.client.logger.logModeration('WARN', interaction.user, target, reason, interaction.guild);
            await mod.logToGuild(interaction.guild, successEmbed);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `${emojis.get('error')} Failed to issue warning.` });
        }
    },
};
