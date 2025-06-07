const { Client, GatewayIntentBits, Collection } = require('discord.js');
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

// Load command files
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

// Bot ready event
client.once('ready', () => {
    logger.info(`🌱 Star Sprout has awakened! Logged in as ${client.user.tag}`);
    logger.info('🌿 The realm stirs with gentle light...');
    
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
