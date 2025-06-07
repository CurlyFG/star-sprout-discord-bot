const { EmbedBuilder, ChannelType } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const messageTemplates = require('../utils/messageTemplates');
const logger = require('../utils/logger');

module.exports = {
    name: 'channel',
    description: 'Set the notification channel for stream alerts',
    
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

        let targetChannel;

        if (args.length === 0) {
            // No channel mentioned, use current channel
            targetChannel = message.channel;
        } else {
            // Channel mentioned
            const channelMention = args[0];
            
            // Extract channel ID from mention
            const channelId = channelMention.replace(/[<#>]/g, '');
            targetChannel = message.guild.channels.cache.get(channelId);

            if (!targetChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#DC143C')
                    .setTitle('🥀 The grove cannot be found...')
                    .setDescription('Please mention a valid text channel.\n\nExample: `!sprout channel #notifications`')
                    .addFields(
                        { name: '💡 Tip', value: 'You can also run this command in the channel you want to use without mentioning it.', inline: false }
                    )
                    .setFooter({ text: 'Star Sprout • Invalid Channel' });
                
                return message.reply({ embeds: [embed] });
            }
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
            const guildId = message.guild.id;
            const channelId = targetChannel.id;

            // Set the notification channel
            await streamMonitor.setNotificationChannel(guildId, channelId);

            // Update existing streamers to use this channel
            const streamers = streamMonitor.getStreamersForGuild(guildId);
            for (const streamer of streamers) {
                await streamMonitor.addStreamer(streamer.platform, streamer.username, guildId, channelId);
            }

            // Success message
            const successMsg = messageTemplates.getSuccessMessage('channel_set', targetChannel.toString());
            const embed = new EmbedBuilder()
                .setColor('#7B68EE')
                .setTitle(successMsg.title)
                .setDescription(successMsg.description)
                .addFields(
                    { name: '🌸 Sacred Grove', value: targetChannel.toString(), inline: true },
                    { name: '👥 Server', value: message.guild.name, inline: true },
                    { name: '📊 Monitored Streamers', value: `${streamers.length} souls`, inline: true }
                )
                .setFooter({ text: 'Star Sprout • Channel Set' })
                .setTimestamp();

            // Send confirmation to the set channel if it's different from current
            if (targetChannel.id !== message.channel.id) {
                // Send to current channel
                message.reply({ embeds: [embed] });
                
                // Send greeting to target channel
                const greetingEmbed = new EmbedBuilder()
                    .setColor('#7B68EE')
                    .setTitle('🌱 The Star Sprout takes root...')
                    .setDescription('This channel has been chosen as the sacred grove for stream notifications.\n\nWhen souls awaken to share their light, the bloom will gently announce their presence here.')
                    .setFooter({ text: 'Star Sprout • New Grove' })
                    .setTimestamp();

                targetChannel.send({ embeds: [greetingEmbed] });
            } else {
                message.reply({ embeds: [embed] });
            }

            logger.info(`Set notification channel for guild ${message.guild.name} to ${targetChannel.name}`);

        } catch (error) {
            logger.error(`Error setting notification channel:`, error);
            
            const errorMsg = messageTemplates.getErrorMessage('generic', 'Failed to set notification channel.');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Error' });
            
            message.reply({ embeds: [embed] });
        }
    }
};
