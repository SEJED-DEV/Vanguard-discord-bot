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
        .addSubcommand(sub =>
            sub.setName('emojis')
            .setDescription('Configure custom branding emojis for this server.')
            .addStringOption(opt => opt.setName('key').setDescription('The emoji slot to configure').setRequired(true).setAutocomplete(true))
            .addStringOption(opt => opt.setName('emoji').setDescription('The emoji to use (e.g., <:name:id> or text)').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = emojis.REQUIRED_KEYS;
        const filtered = choices.filter(choice => choice.startsWith(focusedValue.toLowerCase()));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25),
        );
    },

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'logs') {
            const channel = interaction.options.getChannel('channel');
            db.updateGuildConfigField(interaction.guild.id, 'logChannelId', channel.id);

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.get('success', interaction.guildId)} Configuration Updated`)
                .setDescription(`Logging channel has been set to ${channel}.`)
                .setColor(config.colors.success)
                .setTimestamp()
                .setFooter({ text: `${config.botName} System Config` });

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'emojis') {
            const key = interaction.options.getString('key');
            const emojiString = interaction.options.getString('emoji');

            if (!emojis.REQUIRED_KEYS.includes(key)) {
                return interaction.reply({ content: `Invalid emoji key. Please use one of: ${emojis.REQUIRED_KEYS.join(', ')}`, ephemeral: true });
            }

            const guildConfig = db.getGuildConfig(interaction.guild.id) || {};
            const mapping = guildConfig.emojiMapping || {};
            mapping[key] = emojiString;

            db.updateGuildConfigField(interaction.guild.id, 'emojiMapping', mapping);

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.get('success', interaction.guildId)} Emoji Updated`)
                .setDescription(`Emoji for \`${key}\` has been set to ${emojiString}`)
                .setColor(config.colors.success)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};
