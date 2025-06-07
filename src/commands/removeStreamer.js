const { EmbedBuilder } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const messageTemplates = require('../utils/messageTemplates');
const logger = require('../utils/logger');

module.exports = {
    name: 'remove',
    description: 'Remove a streamer from the watch list',
    
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
                .setDescription('Usage: `!sprout remove <platform> <username>`\n\nExample: `!sprout remove twitch shroud`')
                .addFields(
                    { name: 'Supported Platforms', value: '• `twitch`\n• `youtube`', inline: true }
                )
                .setFooter({ text: 'Star Sprout • Command Help' });
            
            return message.reply({ embeds: [embed] });
        }

        const platform = args[0].toLowerCase();
        const username = args[1];
        const guildId = message.guild.id;

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

        // Check if streamer is being monitored
        const streamers = streamMonitor.getStreamersForGuild(guildId);
        const streamerExists = streamers.find(s => 
            s.platform === platform && s.username.toLowerCase() === username.toLowerCase()
        );

        if (!streamerExists) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 This soul was never in the watch...')
                .setDescription(`**${username}** on ${platform} is not being monitored in this server.`)
                .addFields(
                    { name: '💡 Tip', value: 'Use `!sprout list` to see all monitored streamers.', inline: false }
                )
                .setFooter({ text: 'Star Sprout • Streamer Not Found' });
            
            return message.reply({ embeds: [embed] });
        }

        try {
            // Remove streamer from monitor
            await streamMonitor.removeStreamer(platform, username, guildId);

            // Success message
            const successMsg = messageTemplates.getSuccessMessage('streamer_removed', `${username} on ${platform}`);
            const embed = new EmbedBuilder()
                .setColor('#7B68EE')
                .setTitle(successMsg.title)
                .setDescription(successMsg.description)
                .addFields(
                    { name: '📱 Platform', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
                    { name: '👤 Username', value: username, inline: true }
                )
                .setFooter({ text: 'Star Sprout • Streamer Removed' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
            
            logger.info(`Removed ${platform} streamer ${username} from guild ${message.guild.name}`);

        } catch (error) {
            logger.error(`Error removing streamer ${username} on ${platform}:`, error);
            
            const errorMsg = messageTemplates.getErrorMessage('generic', 'Failed to remove streamer from watch list.');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Error' });
            
            message.reply({ embeds: [embed] });
        }
    }
};
