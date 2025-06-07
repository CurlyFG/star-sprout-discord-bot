const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const logger = require('./src/utils/logger');
const streamMonitor = require('./src/services/streamMonitor');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize commands collection
client.commands = new Collection();
client.slashCommands = new Collection();

// Load prefix command files
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

// Load slash command files
const slashCommandFiles = fs.readdirSync('./src/slashCommands').filter(file => file.endsWith('.js'));
for (const file of slashCommandFiles) {
    const command = require(`./src/slashCommands/${file}`);
    if (command.data) {
        client.slashCommands.set(command.data.name, command);
    }
}

// Bot ready event
client.once('ready', async () => {
    logger.info(`🌱 Star Sprout has awakened! Logged in as ${client.user.tag}`);
    logger.info('🌿 The realm stirs with gentle light...');
    
    // Deploy slash commands
    try {
        await deploySlashCommands();
    } catch (error) {
        logger.error('Failed to deploy slash commands:', error);
    }
    
    // Start stream monitoring
    streamMonitor.initialize(client);
    
    // Schedule stream checks every 2 minutes
    cron.schedule('*/2 * * * *', () => {
        streamMonitor.checkAllStreams();
    });
    
    logger.info('🌌 Stream monitoring has begun. The bloom watches for radiant moments...');
});

// Message handling for commands
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const prefix = '!sprout';
    if (!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName);
    if (!command) return;
    
    try {
        await command.execute(message, args);
    } catch (error) {
        logger.error('Error executing command:', error);
        message.reply('🥀 The bloom withers... something went wrong while processing your request.');
    }
});

// Error handling
client.on('error', (error) => {
    logger.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});

// Login to Discord
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
    logger.error('🥀 No Discord bot token found. Please set DISCORD_BOT_TOKEN environment variable.');
    process.exit(1);
}

client.login(token);
