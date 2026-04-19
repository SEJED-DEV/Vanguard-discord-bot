const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const emojis = require('../../utils/emojis');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a message through the bot with a beautiful embed.')
        .addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const message = interaction.options.getString('message');

        // Content processing (handle newlines)
        const processedMessage = message.replace(/\\n/g, '\n');

        const embed = new EmbedBuilder()
            .setDescription(processedMessage)
            .setColor(config.colors.info)
            .setTimestamp()
            .setFooter({ text: `Message via ${config.botName}` });

        // The user asked for "automatically applies embed"
        // We can also include the bot's thumbnail if available
        try {
            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: `${emojis.get('success')} Message sent!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `${emojis.get('error')} Failed to send message.`, ephemeral: true });
        }
    },
};
