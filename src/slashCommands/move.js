const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a specific streamer\'s notifications to a different channel')
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
                .setDescription('The new channel for notifications')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)),

    async execute(interaction) {
        await interaction.deferReply();

        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');
        const targetChannel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id;

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
                    { name: '💡 Tip', value: 'Use `/list` to see all monitored streamers.', inline: false }
                )
                .setFooter({ text: 'Star Sprout • Streamer Not Found' });
            
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

            await interaction.editReply({ embeds: [embed] });
            
            logger.info(`Moved ${platform} streamer ${username} to channel ${targetChannel.name} in guild ${interaction.guild.name}`);

        } catch (error) {
            logger.error(`Error moving streamer ${username} on ${platform}:`, error);
            
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle('🥀 The bloom encounters shadow...')
                .setDescription('Failed to move streamer to new channel.')
                .setFooter({ text: 'Star Sprout • Error' });
            
            await interaction.editReply({ embeds: [embed] });
        }
    }
};