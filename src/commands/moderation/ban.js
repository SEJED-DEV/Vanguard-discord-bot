const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mod = require('../../utils/moderation');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guild = interaction.guild;
        
        // Defer reply for potentially long operations
        await interaction.deferReply({ ephemeral: true });

        const member = await guild.members.fetch(target.id).catch(() => null);

        // Check if user is already banned
        const existingBan = await guild.bans.fetch(target.id).catch(() => null);
        if (existingBan) {
            return interaction.editReply({ content: `${emojis.get('error', interaction.guildId)} **${target.tag}** is already banned from this server.` });
        }

        // Permission Checks
        if (member) {
            if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
                return interaction.editReply({ content: `${emojis.get('error', interaction.guildId)} You cannot ban someone with a role higher or equal to yours.` });
            }
            if (!member.bannable) {
                return interaction.editReply({ 
                    content: `${emojis.get('error', interaction.guildId)} I cannot ban this user. They might have a higher role than me or are the server owner.`, 
                });
            }
        }

        try {
            // Attempt DM BEFORE Ban
            await mod.sendDM(target, guild, 'BANNED', reason);

            // Execute Ban
            await guild.members.ban(target, { reason });

            // Create Case
            const newCase = await mod.createCase(guild.id, target.id, interaction.user.id, 'BAN', reason);

            // Create Success Embed
            const successEmbed = new EmbedBuilder()
                .setTitle(`${emojis.get('ban', interaction.guildId)} User Banned`)
                .setDescription(`**${target.tag}** has been banned from the server.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Case', value: `#${newCase.caseNumber}`, inline: true }
                )
                .setColor(config.colors.error)
                .setTimestamp()
                .setFooter({ text: `${config.botName} Moderation` });

            // Replying to interaction (already deferred)
            await interaction.editReply({ embeds: [successEmbed] });

            // Global & Local Logging
            await interaction.client.logger.logModeration('BAN', interaction.user, target, reason, guild);
            await mod.logToGuild(guild, successEmbed);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: `${emojis.get('error', interaction.guildId)} Failed to ban the user. Check my permissions or if the user is already gone.`, 
            });
        }
    },
};
