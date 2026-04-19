const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { hasPermission } = require('../../utils/permissions');
const emojis = require('../../utils/emojis');
const config = require('../../config');
const system = require('../../utils/system');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-emojis')
        .setDescription('Owner Only: List all required custom emoji slots for the bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!system.isDeveloper(interaction.user.id)) {
            return interaction.reply({ content: `Only ${config.botName} developers can use this command.`, ephemeral: true });
        }

        const requiredKeys = require('../../utils/emojis').REQUIRED_KEYS;
        const emojiList = requiredKeys.map(key => `**${key}**: \`${emojis.get(key)}\``).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`${config.botName} | Emoji Slots`)
            .setDescription(`This bot requires custom emojis for its branding. Please provide the emoji strings (e.g., \`<:name:id>\`) for each of the following keys in the configuration.\n\n${emojiList}`)
            .setColor(config.colors.info)
            .setFooter({ text: `${config.botName} System Management` });

        await interaction.reply({ embeds: [embed] });
    },
};
