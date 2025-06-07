const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const messageTemplates = require('../utils/messageTemplates');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a streamer to the watch list')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('The streaming platform')
                .setRequired(true)
                .addChoices(
                    { name: 'Twitch', value: 'twitch' },
                    { name: 'YouTube', value: 'youtube' }
                ))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The streamer\'s username or handle')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel for notifications (optional - uses current channel if not specified)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
        const guildId = interaction.guild.id;

        // Validate channel type
        if (targetChannel.type !== 0) { // GuildText
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The bloom needs fertile ground...')
                .setDescription('Please choose a text channel for notifications.')
                .setFooter({ text: 'Star Sprout • Invalid Channel Type' });
            
            return interaction.editReply({ embeds: [embed] });
        }

        // Check bot permissions in target channel
        const botPermissions = targetChannel.permissionsFor(interaction.guild.members.me);
        if (!botPermissions.has(['SendMessages', 'EmbedLinks'])) {
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The bloom cannot reach this grove...')
                .setDescription(`I need permission to send messages and embed links in ${targetChannel}.`)
                .addFields(
                    { name: 'Required Permissions', value: '• Send Messages\n• Embed Links', inline: false }
                )
                .setFooter({ text: 'Star Sprout • Insufficient Permissions' });
            
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            // Test if the streamer exists by checking their status
            if (platform === 'twitch') {
                const twitchService = require('../services/twitchService');
                await twitchService.isUserLive(username);
            } else if (platform === 'youtube') {
                const youtubeService = require('../services/youtubeService');
                await youtubeService.isChannelLive(username);
            }

            // Add streamer to monitor
            await streamMonitor.addStreamer(platform, username, guildId, targetChannel.id);

            // Success message
            const successMsg = messageTemplates.getSuccessMessage('streamer_added', `${username} on ${platform}`);
            const embed = new EmbedBuilder()
                .setColor('#7B68EE')
                .setTitle(successMsg.title)
                .setDescription(successMsg.description)
                .addFields(
                    { name: '📱 Platform', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
                    { name: '👤 Username', value: username, inline: true },
                    { name: '📢 Channel', value: `<#${targetChannel.id}>`, inline: true }
                )
                .setFooter({ text: 'Star Sprout • Streamer Added' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            
            logger.info(`Added ${platform} streamer ${username} to guild ${interaction.guild.name}`);

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
            
            await interaction.editReply({ embeds: [embed] });
        }
    }
};