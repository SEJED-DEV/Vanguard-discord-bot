const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const config = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
    ],
});

// Collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Global Error Handling
const Logger = require('./utils/logger');
client.logger = new Logger(client);
const loggerRef = client.logger;

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
    loggerRef.logError(error, 'Global - unhandledRejection');
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    loggerRef.logError(error, 'Global - uncaughtException');
});

// Load Handlers
const handlersPath = path.join(__dirname, 'handlers');
fs.readdirSync(handlersPath).forEach(handlerFile => {
    require(`./handlers/${handlerFile}`)(client);
});

// Interactions
client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Global Rate Limiting (Cooldowns)
    if (!client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown || config.defaults.cooldown) * 1000;

    if (timestamps.has(interaction.user.id) && interaction.user.id !== config.ownerId) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return interaction.reply({ 
                content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`, 
                ephemeral: true 
            });
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[COMMAND ERROR] ${command.data.name}:`, error);
        await loggerRef.logError(error, `Command Execution: ${command.data.name}`);
        
        const errorMsg = 'There was an error while executing this command!';
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMsg, ephemeral: true });
            } else if (interaction.isRepliable()) {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        } catch (postError) {
            console.error(`[CRITICAL] Failed to send error response to user:`, postError.message);
        }
    }
});

client.once('ready', () => {
    console.log(`${config.botName} Online | Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
