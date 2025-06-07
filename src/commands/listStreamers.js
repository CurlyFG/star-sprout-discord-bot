const { EmbedBuilder } = require('discord.js');
const streamMonitor = require('../services/streamMonitor');

module.exports = {
    name: 'list',
    description: 'List all monitored streamers',
    
    async execute(message, args) {
        const guildId = message.guild.id;
        const streamers = streamMonitor.getStreamersForGuild(guildId);
        const liveStreams = streamMonitor.config.liveStreams;

        if (streamers.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#7B68EE')
                .setTitle('🌾 The grove rests quietly...')
                .setDescription('No streamers are currently being watched in this server.\n\nUse `!sprout add <platform> <username>` to begin the watch.')
                .setFooter({ text: 'Star Sprout • Empty Watch List' });
            
            return message.reply({ embeds: [embed] });
        }

        // Group streamers by platform
        const platforms = {
            twitch: streamers.filter(s => s.platform === 'twitch'),
            youtube: streamers.filter(s => s.platform === 'youtube')
        };

        const embed = new EmbedBuilder()
            .setColor('#7B68EE')
            .setTitle('🌿 Souls in the Star Sprout\'s watch')
            .setDescription('Here are all the streamers the bloom watches for radiant moments:')
            .setFooter({ text: `Star Sprout • ${streamers.length} souls watched` })
            .setTimestamp();

        // Add Twitch streamers
        if (platforms.twitch.length > 0) {
            const twitchList = platforms.twitch.map(streamer => {
                const key = `twitch:${streamer.username}`;
                const isLive = liveStreams[key] ? '🟢 LIVE' : '⚫ Offline';
                return `${isLive} **${streamer.username}** → <#${streamer.channel}>`;
            }).join('\n');

            embed.addFields({
                name: `🟣 Twitch (${platforms.twitch.length})`,
                value: twitchList,
                inline: false
            });
        }

        // Add YouTube streamers
        if (platforms.youtube.length > 0) {
            const youtubeList = platforms.youtube.map(streamer => {
                const key = `youtube:${streamer.username}`;
                const isLive = liveStreams[key] ? '🔴 LIVE' : '⚫ Offline';
                return `${isLive} **${streamer.username}** → <#${streamer.channel}>`;
            }).join('\n');

            embed.addFields({
                name: `🔴 YouTube (${platforms.youtube.length})`,
                value: youtubeList,
                inline: false
            });
        }

        // Add live streams summary if any
        const liveCount = Object.keys(liveStreams).length;
        if (liveCount > 0) {
            embed.addFields({
                name: '✨ Current Blooms',
                value: `${liveCount} streamer${liveCount === 1 ? '' : 's'} currently live and glowing!`,
                inline: false
            });
        }

        // Add usage tip
        embed.addFields({
            name: '💡 Bloom Tending',
            value: '• `!sprout add <platform> <username>` - Add new soul to watch\n• `!sprout remove <platform> <username>` - Release from watch\n• `!sprout channel #channel` - Set notification grove',
            inline: false
        });

        message.reply({ embeds: [embed] });
    }
};
