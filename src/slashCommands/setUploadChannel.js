const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const MessageTemplates = require('../utils/messageTemplates');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuploadchannel')
        .setDescription('Set a specific channel for YouTube upload notifications')
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('Platform (youtube)')
                .setRequired(true)
                .addChoices({ name: 'YouTube', value: 'youtube' }))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('YouTube channel (e.g., @curlyfitgamer)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Discord channel for upload notifications')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');
        const channel = interaction.options.getChannel('channel');
        const templates = new MessageTemplates();

        if (!channel.isTextBased()) {
            await interaction.reply({
                content: templates.getErrorMessage('invalidChannel', 'Please select a text channel'),
                ephemeral: true
            });
            return;
        }

        try {
            await streamMonitor.setUploadChannel(platform, username, interaction.guild.id, channel.id);
            
            await interaction.reply({
                content: templates.getSuccessMessage('uploadChannelSet', 
                    `🌸 Upload notifications for ${username} will bloom in ${channel}`)
            });
        } catch (error) {
            console.error('Error setting upload channel:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: templates.getErrorMessage('uploadChannelFailed', error.message)
                });
            } else {
                await interaction.reply({
                    content: templates.getErrorMessage('uploadChannelFailed', error.message),
                    flags: 64
                });
            }
        }
    }
};