const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Temporarily timeout a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to timeout').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('Duration (e.g. 10m, 1h, 1d)').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the timeout').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        await interaction.deferReply({ ephemeral: true });

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.editReply({ content: `${emojis.get('error')} User not found in this server.` });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.editReply({ content: `${emojis.get('error')} You cannot timeout someone with a role higher or equal to yours.` });
        }

        const durationMs = ms(durationStr);
        if (!durationMs || durationMs < 5000 || durationMs > 2.419e9) {
            return interaction.editReply({ 
                content: `${emojis.get('error')} Invalid duration. Must be between 5s and 28 days (e.g. 10m, 1h, 1d).`, 
            });
        }

        try {
            // Attempt DM BEFORE Timeout
            await mod.sendDM(targetUser, interaction.guild, 'TIMED OUT', reason, durationStr);

            await member.timeout(durationMs, reason);

            const newCase = await mod.createCase(interaction.guild.id, targetUser.id, interaction.user.id, 'TIMEOUT', reason, durationStr);

            const successEmbed = new EmbedBuilder()
                .setTitle(`${emojis.get('timeout')} User Timed Out`)
                .setDescription(`**${targetUser.tag}** has been timed out for ${durationStr}.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case', value: `#${newCase.caseNumber}`, inline: true }
                )
                .setColor(config.colors.timeout)
                .setTimestamp()
                .setFooter({ text: `${config.botName} Moderation` });

            await interaction.editReply({ embeds: [successEmbed] });

            await interaction.client.logger.logModeration('TIMEOUT', interaction.user, targetUser, reason, interaction.guild);
            await mod.logToGuild(interaction.guild, successEmbed);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `${emojis.get('error')} Failed to timeout user. Check current status or permissions.` });
        }
    },
};
