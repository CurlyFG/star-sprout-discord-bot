const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');
const messageTemplates = require('../utils/messageTemplates');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Set the default notification channel for stream alerts')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('target')
                .setDescription('Channel for notifications (optional - uses current channel if not specified)')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText)),

    async execute(interaction) {
        await interaction.deferReply();

        const targetChannel = interaction.options.getChannel('target') || interaction.channel;

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
            const guildId = interaction.guild.id;
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
                    { name: '👥 Server', value: interaction.guild.name, inline: true },
                    { name: '📊 Monitored Streamers', value: `${streamers.length} souls`, inline: true }
                )
                .setFooter({ text: 'Star Sprout • Channel Set' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Send greeting to target channel if it's different from current
            if (targetChannel.id !== interaction.channel.id) {
                const greetingEmbed = new EmbedBuilder()
                    .setColor('#7B68EE')
                    .setTitle('🌱 The Star Sprout takes root...')
                    .setDescription('This channel has been chosen as the sacred grove for stream notifications.\n\nWhen souls awaken to share their light, the bloom will gently announce their presence here.')
                    .setFooter({ text: 'Star Sprout • New Grove' })
                    .setTimestamp();

                targetChannel.send({ embeds: [greetingEmbed] });
            }

            logger.info(`Set notification channel for guild ${interaction.guild.name} to ${targetChannel.name}`);

        } catch (error) {
            logger.error(`Error setting notification channel:`, error);
            
            const errorMsg = messageTemplates.getErrorMessage('generic', 'Failed to set notification channel.');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Error' });
            
            await interaction.editReply({ embeds: [embed] });
        }
    }
};