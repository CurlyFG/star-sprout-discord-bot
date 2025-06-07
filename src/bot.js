const { EmbedBuilder } = require('discord.js');
const logger = require('./utils/logger');
const messageTemplates = require('./utils/messageTemplates');

class StarSproutBot {
    constructor(client) {
        this.client = client;
    }

    // Send introduction message to a guild
    async sendIntroMessage(guild, channelId) {
        try {
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
                logger.warn(`Channel ${channelId} not found in guild ${guild.name}`);
                return;
            }

            const introEmbed = new EmbedBuilder()
                .setColor('#7B68EE')
                .setTitle('🌱 A soft rustle in the roots...')
                .setDescription(`Hello, friends of ${guild.name}.\n\nI am **Star Sprout**, and I bloom only when something radiant takes root.\n\nWhenever someone goes LIVE, I will gently shine the path for you to follow.\n\n🌿 Stay close to the glow.`)
                .setFooter({ text: 'Star Sprout • Realm Notifier' })
                .setTimestamp();

            await channel.send({ embeds: [introEmbed] });
            logger.info(`Sent introduction message to ${guild.name}`);
        } catch (error) {
            logger.error('Error sending intro message:', error);
        }
    }

    // Send live stream notification
    async sendLiveNotification(platform, streamerData, channelIds) {
        const template = messageTemplates.getLiveTemplate(platform, streamerData);
        
        const embed = new EmbedBuilder()
            .setColor(platform === 'twitch' ? '#9146FF' : '#FF0000')
            .setTitle(template.title)
            .setDescription(template.description)
            .addFields(
                { name: '📌 Stream Title', value: streamerData.title || 'No title available', inline: false },
                { name: '🎮 Category', value: streamerData.game || streamerData.category || 'No category', inline: true },
                { name: '🔗 Watch Now', value: `[Step into the stream](${streamerData.url})`, inline: true }
            )
            .setFooter({ text: `Star Sprout • ${platform.charAt(0).toUpperCase() + platform.slice(1)} Watcher` })
            .setTimestamp();

        if (streamerData.thumbnail) {
            embed.setImage(streamerData.thumbnail);
        }

        // Send to all configured channels
        for (const channelId of channelIds) {
            try {
                const channel = this.client.channels.cache.get(channelId);
                if (channel) {
                    const message = await channel.send({ 
                        content: template.content,
                        embeds: [embed] 
                    });
                    
                    // Add bloom reaction
                    await message.react('🌱');
                    
                    logger.info(`Sent ${platform} live notification for ${streamerData.username} to ${channel.guild.name}`);
                } else {
                    logger.warn(`Channel ${channelId} not found`);
                }
            } catch (error) {
                logger.error(`Error sending notification to channel ${channelId}:`, error);
            }
        }
    }

    // Send stream ended notification (optional)
    async sendStreamEndedNotification(platform, streamerData, channelIds) {
        const embed = new EmbedBuilder()
            .setColor('#4B0082')
            .setTitle('🌌 The bloom gently folds its petals...')
            .setDescription(`**${streamerData.username}** has ended their stream.\n\nThe light has dimmed, but new blooms will come.`)
            .setFooter({ text: 'Star Sprout • Stream Watcher' })
            .setTimestamp();

        for (const channelId of channelIds) {
            try {
                const channel = this.client.channels.cache.get(channelId);
                if (channel) {
                    const message = await channel.send({ embeds: [embed] });
                    await message.react('🌌');
                }
            } catch (error) {
                logger.error(`Error sending stream ended notification to channel ${channelId}:`, error);
            }
        }
    }
}

module.exports = StarSproutBot;
