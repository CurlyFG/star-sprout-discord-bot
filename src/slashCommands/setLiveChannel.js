const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const MessageTemplates = require('../utils/messageTemplates');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlivechannel')
        .setDescription('Set a specific channel for live stream notifications')
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('Platform (youtube or twitch)')
                .setRequired(true)
                .addChoices(
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'Twitch', value: 'twitch' }
                ))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Channel username (e.g., @curlyfitgamer or curlyfitgamer)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Discord channel for live stream notifications')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // Immediately defer to prevent timeout
        await interaction.deferReply();
        
        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');
        const channel = interaction.options.getChannel('channel');
        const templates = new MessageTemplates();

        if (!channel.isTextBased()) {
            await interaction.editReply({
                content: templates.getErrorMessage('invalidChannel', 'Please select a text channel')
            });
            return;
        }

        try {
            await streamMonitor.setLiveChannel(platform, username, interaction.guild.id, channel.id);
            
            await interaction.editReply({
                content: templates.getSuccessMessage('liveChannelSet', 
                    `🌟 Live stream notifications for ${username} will shine in ${channel}`)
            });
        } catch (error) {
            console.error('Error setting live channel:', error);
            await interaction.editReply({
                content: templates.getErrorMessage('liveChannelFailed', error.message)
            });
        }
    }
};