const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server.')
        .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the kick').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guild = interaction.guild;

        await interaction.deferReply({ ephemeral: true });

        const member = await guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.editReply({ content: `${emojis.get('error', interaction.guildId)} User is not in this server.` });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.editReply({ content: `${emojis.get('error', interaction.guildId)} You cannot kick someone with a role higher or equal to yours.` });
        }

        if (!member.kickable) {
            return interaction.editReply({ 
                    content: `${emojis.get('error', interaction.guildId)} I cannot kick this user. Hierarchical permissions issue.`, 
            });
        }

        try {
            // Attempt DM BEFORE Kick
            await mod.sendDM(targetUser, guild, 'KICKED', reason);

            await member.kick(reason);

            const newCase = await mod.createCase(guild.id, targetUser.id, interaction.user.id, 'KICK', reason);

            const successEmbed = new EmbedBuilder()
                .setTitle(`${emojis.get('kick', interaction.guildId)} User Kicked`)
                .setDescription(`**${targetUser.tag}** has been kicked.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case', value: `#${newCase.caseNumber}`, inline: true }
                )
                .setColor(config.colors.kick)
                .setTimestamp()
                .setFooter({ text: `${config.botName} Moderation` });

            await interaction.editReply({ embeds: [successEmbed] });

            await interaction.client.logger.logModeration('KICK', interaction.user, targetUser, reason, guild);
            await mod.logToGuild(guild, successEmbed);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `${emojis.get('error', interaction.guildId)} Failed to kick the user.` });
        }
    },
};
