const { EmbedBuilder } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const messageTemplates = require('../utils/messageTemplates');
const logger = require('../utils/logger');

module.exports = {
    name: 'add',
    description: 'Add a streamer to the watch list',
    
    async execute(message, args) {
        // Check permissions
        if (!message.member.permissions.has('Administrator')) {
            const errorMsg = messageTemplates.getErrorMessage('permission');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Permission Denied' });
            
            return message.reply({ embeds: [embed] });
        }

        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The bloom needs guidance...')
                .setDescription('Usage: `!sprout add <platform> <username>`\n\nExample: `!sprout add twitch shroud`')
                .addFields(
                    { name: 'Supported Platforms', value: '• `twitch`\n• `youtube`', inline: true }
                )
                .setFooter({ text: 'Star Sprout • Command Help' });
            
            return message.reply({ embeds: [embed] });
        }

        const platform = args[0].toLowerCase();
        const username = args[1];

        // Validate platform
        if (!['twitch', 'youtube'].includes(platform)) {
            const errorMsg = messageTemplates.getErrorMessage('invalid_platform');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Invalid Platform' });
            
            return message.reply({ embeds: [embed] });
        }

        // Check if notification channel is set
        const config = streamMonitor.config;
        const guildId = message.guild.id;
        const channelId = config.channels[guildId] || message.channel.id;

        try {
            // Test if the streamer exists by checking their status
            let testResult = null;
            
            if (platform === 'twitch') {
                const twitchService = require('../services/twitchService');
                testResult = await twitchService.isUserLive(username);
                // For Twitch, we just need to verify the user exists (null means not live, but user exists)
                // If user doesn't exist, an error will be thrown
            } else if (platform === 'youtube') {
                const youtubeService = require('../services/youtubeService');
                testResult = await youtubeService.isChannelLive(username);
                // Same for YouTube
            }

            // Add streamer to monitor
            await streamMonitor.addStreamer(platform, username, guildId, channelId);

            // Success message
            const successMsg = messageTemplates.getSuccessMessage('streamer_added', `${username} on ${platform}`);
            const embed = new EmbedBuilder()
                .setColor('#7B68EE')
                .setTitle(successMsg.title)
                .setDescription(successMsg.description)
                .addFields(
                    { name: '📱 Platform', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
                    { name: '👤 Username', value: username, inline: true },
                    { name: '📢 Channel', value: `<#${channelId}>`, inline: true }
                )
                .setFooter({ text: 'Star Sprout • Streamer Added' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
            
            logger.info(`Added ${platform} streamer ${username} to guild ${message.guild.name}`);

        } catch (error) {
            logger.error(`Error adding streamer ${username} on ${platform}:`, error);
            
            const errorMsg = messageTemplates.getErrorMessage('invalid_username', username);
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .addFields(
                    { name: '💡 Tip', value: `Make sure "${username}" is the correct ${platform} username/handle.`, inline: false }
                )
                .setFooter({ text: 'Star Sprout • User Not Found' });
            
            message.reply({ embeds: [embed] });
        }
    }
};
