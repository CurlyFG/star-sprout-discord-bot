const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const messageTemplates = require('../utils/messageTemplates');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a streamer from the watch list')
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
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');
        const guildId = interaction.guild.id;

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
                    { name: '💡 Tip', value: 'Use `/list` to see all monitored streamers.', inline: false }
                )
                .setFooter({ text: 'Star Sprout • Streamer Not Found' });
            
            return interaction.editReply({ embeds: [embed] });
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

            await interaction.editReply({ embeds: [embed] });
            
            logger.info(`Removed ${platform} streamer ${username} from guild ${interaction.guild.name}`);

        } catch (error) {
            logger.error(`Error removing streamer ${username} on ${platform}:`, error);
            
            const errorMsg = messageTemplates.getErrorMessage('generic', 'Failed to remove streamer from watch list.');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Error' });
            
            await interaction.editReply({ embeds: [embed] });
        }
    }
};