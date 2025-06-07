const { EmbedBuilder, ChannelType } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const messageTemplates = require('../utils/messageTemplates');
const logger = require('../utils/logger');

module.exports = {
    name: 'move',
    description: 'Move a specific streamer\'s notifications to a different channel',
    
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

        if (args.length < 3) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The bloom needs guidance...')
                .setDescription('Usage: `!sprout move <platform> <username> <#channel>`\n\nExample: `!sprout move twitch shroud #gaming-streams`')
                .addFields(
                    { name: 'Supported Platforms', value: '• `twitch`\n• `youtube`', inline: true }
                )
                .setFooter({ text: 'Star Sprout • Command Help' });
            
            return message.reply({ embeds: [embed] });
        }

        const platform = args[0].toLowerCase();
        const username = args[1];
        const channelMention = args[2];
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

        // Check if streamer exists
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

        // Parse target channel
        const channelId = channelMention.replace(/[<#>]/g, '');
        const targetChannel = message.guild.channels.cache.get(channelId);

        if (!targetChannel) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The grove cannot be found...')
                .setDescription('Please mention a valid text channel.\n\nExample: `!sprout move twitch shroud #gaming-streams`')
                .setFooter({ text: 'Star Sprout • Invalid Channel' });
            
            return message.reply({ embeds: [embed] });
        }

        // Check if it's a text channel
        if (targetChannel.type !== ChannelType.GuildText) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The bloom needs fertile ground...')
                .setDescription('Please choose a text channel for notifications.')
                .setFooter({ text: 'Star Sprout • Invalid Channel Type' });
            
            return message.reply({ embeds: [embed] });
        }

        // Check bot permissions in target channel
        const botPermissions = targetChannel.permissionsFor(message.guild.members.me);
        if (!botPermissions.has(['SendMessages', 'EmbedLinks'])) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The bloom cannot reach this grove...')
                .setDescription(`I need permission to send messages and embed links in ${targetChannel}.`)
                .addFields(
                    { name: 'Required Permissions', value: '• Send Messages\n• Embed Links', inline: false }
                )
                .setFooter({ text: 'Star Sprout • Insufficient Permissions' });
            
            return message.reply({ embeds: [embed] });
        }

        try {
            // Move the streamer to new channel
            await streamMonitor.addStreamer(platform, username, guildId, targetChannel.id);

            // Success message
            const embed = new EmbedBuilder()
                .setColor('#7B68EE')
                .setTitle('🌿 The soul\'s light finds a new grove...')
                .setDescription(`**${username}** on ${platform} will now bloom in ${targetChannel}`)
                .addFields(
                    { name: '📱 Platform', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
                    { name: '👤 Username', value: username, inline: true },
                    { name: '🌸 New Grove', value: targetChannel.toString(), inline: true }
                )
                .setFooter({ text: 'Star Sprout • Streamer Moved' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
            
            logger.info(`Moved ${platform} streamer ${username} to channel ${targetChannel.name} in guild ${message.guild.name}`);

        } catch (error) {
            logger.error(`Error moving streamer ${username} on ${platform}:`, error);
            
            const errorMsg = messageTemplates.getErrorMessage('generic', 'Failed to move streamer to new channel.');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Error' });
            
            message.reply({ embeds: [embed] });
        }
    }
};