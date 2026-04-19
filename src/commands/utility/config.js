const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database/index');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure bot settings for this server.')
        .addSubcommand(sub => 
            sub.setName('logs')
            .setDescription('Set the logging channel for moderation actions.')
            .addChannelOption(opt => opt.setName('channel').setDescription('The channel to send logs to').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'logs') {
            const channel = interaction.options.getChannel('channel');
            
            // Get current guildConfig or create new one
            let guildConfig = db.getGuildConfig(interaction.guild.id) || {
                guildId: interaction.guild.id,
                logChannelId: null,
                adminRoles: '[]',
                modRoles: '[]',
                mutedRoleId: null,
                autoModEnabled: 0,
                emojiMapping: '{}',
                premium: 0
            };

            guildConfig.logChannelId = channel.id;
            
            // Save to DB
            db.updateGuildConfig(interaction.guild.id, {
                ...guildConfig,
                logChannelId: channel.id
            });

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.get('success')} Configuration Updated`)
                .setDescription(`Logging channel has been set to ${channel}.`)
                .setColor(config.colors.success)
                .setTimestamp()
                .setFooter({ text: `${config.botName} System Config` });

            await interaction.reply({ embeds: [embed] });
        }
    },
};
