const fs = require('fs').promises;
const path = require('path');
const twitchService = require('./twitchService');
const youtubeService = require('./youtubeService');
const StarSproutBot = require('../bot');
const logger = require('../utils/logger');

class StreamMonitor {
    constructor() {
        this.configPath = path.join(__dirname, '../../config/config.json');
        this.config = null;
        this.bot = null;
        this.isChecking = false;
    }

    // Initialize the monitor
    async initialize(client) {
        this.bot = new StarSproutBot(client);
        await this.loadConfig();
        logger.info('🌱 Stream monitor initialized and ready to bloom');
    }

    // Load configuration from file
    async loadConfig() {
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(data);
        } catch (error) {
            logger.warn('Config file not found or invalid, creating new one');
            this.config = {
                streamers: {},
                channels: {},
                liveStreams: {},
                notifiedUploads: {},
                checkInterval: 2,
                maxRetries: 3,
                retryDelay: 5000
            };
            await this.saveConfig();
        }
    }

    // Save configuration to file
    async saveConfig() {
        try {
            await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            logger.error('Error saving config:', error);
        }
    }

    // Add a streamer to monitor
    async addStreamer(platform, username, guildId, channelId) {
        const key = `${platform}:${username}`;
        
        if (!this.config.streamers[key]) {
            this.config.streamers[key] = {
                platform,
                username,
                guilds: {}
            };
        }

        this.config.streamers[key].guilds[guildId] = channelId;
        await this.saveConfig();
        
        logger.info(`Added ${platform} streamer ${username} for guild ${guildId}`);
    }

    // Remove a streamer from monitoring
    async removeStreamer(platform, username, guildId) {
        const key = `${platform}:${username}`;
        
        if (this.config.streamers[key]) {
            delete this.config.streamers[key].guilds[guildId];
            
            // If no guilds are monitoring this streamer, remove it completely
            if (Object.keys(this.config.streamers[key].guilds).length === 0) {
                delete this.config.streamers[key];
                delete this.config.liveStreams[key];
            }
        }

        await this.saveConfig();
        logger.info(`Removed ${platform} streamer ${username} for guild ${guildId}`);
    }

    // Set notification channel for a guild
    async setNotificationChannel(guildId, channelId) {
        this.config.channels[guildId] = channelId;
        await this.saveConfig();
        logger.info(`Set notification channel for guild ${guildId} to ${channelId}`);
    }

    // Get all streamers for a guild
    getStreamersForGuild(guildId) {
        const streamers = [];
        
        for (const [key, streamer] of Object.entries(this.config.streamers)) {
            if (streamer.guilds[guildId]) {
                streamers.push({
                    platform: streamer.platform,
                    username: streamer.username,
                    channel: streamer.guilds[guildId]
                });
            }
        }

        return streamers;
    }

    // Check all streams for live status
    async checkAllStreams() {
        if (this.isChecking) {
            logger.debug('Stream check already in progress, skipping...');
            return;
        }

        this.isChecking = true;
        
        try {
            logger.debug('🌿 Checking for radiant blooms...');
            
            // Group streamers by platform
            const twitchStreamers = [];
            const youtubeStreamers = [];
            
            for (const [key, streamer] of Object.entries(this.config.streamers)) {
                if (streamer.platform === 'twitch') {
                    twitchStreamers.push(streamer.username);
                } else if (streamer.platform === 'youtube') {
                    youtubeStreamers.push(streamer.username);
                }
            }

            // Check Twitch streams
            if (twitchStreamers.length > 0) {
                await this.checkTwitchStreams(twitchStreamers);
            }

            // Check YouTube streams
            if (youtubeStreamers.length > 0) {
                await this.checkYouTubeStreams(youtubeStreamers);
                await this.checkYouTubeUploads(youtubeStreamers);
            }

        } catch (error) {
            logger.error('Error during stream check:', error);
        } finally {
            this.isChecking = false;
        }
    }

    // Check Twitch streams
    async checkTwitchStreams(usernames) {
        try {
            const liveStreams = await twitchService.getMultipleStreams(usernames);
            
            for (const stream of liveStreams) {
                await this.handleStreamStatus('twitch', stream.username, stream);
            }

            // Check for streams that went offline
            for (const username of usernames) {
                const key = `twitch:${username}`;
                const isCurrentlyLive = liveStreams.some(s => s.username === username);
                
                if (!isCurrentlyLive && this.config.liveStreams[key]) {
                    await this.handleStreamStatus('twitch', username, null);
                }
            }
        } catch (error) {
            logger.error('Error checking Twitch streams:', error);
        }
    }

    // Check YouTube streams
    async checkYouTubeStreams(identifiers) {
        try {
            const liveStreams = await youtubeService.getMultipleLiveStreams(identifiers);
            
            for (const stream of liveStreams) {
                await this.handleStreamStatus('youtube', stream.username, stream);
            }

            // Check for streams that went offline
            for (const identifier of identifiers) {
                const key = `youtube:${identifier}`;
                const isCurrentlyLive = liveStreams.some(s => s.username === identifier);
                
                if (!isCurrentlyLive && this.config.liveStreams[key]) {
                    await this.handleStreamStatus('youtube', identifier, null);
                }
            }
        } catch (error) {
            logger.error('Error checking YouTube streams:', error);
        }
    }

    // Handle stream status changes
    async handleStreamStatus(platform, username, streamData) {
        const key = `${platform}:${username}`;
        const wasLive = this.config.liveStreams[key];
        const isLive = streamData !== null;

        if (isLive && !wasLive) {
            // Stream went live
            this.config.liveStreams[key] = {
                ...streamData,
                notifiedAt: Date.now()
            };
            
            await this.saveConfig();
            await this.sendLiveNotifications(platform, username, streamData);
            
            logger.info(`🌱 ${username} has bloomed on ${platform}!`);
            
        } else if (!isLive && wasLive) {
            // Stream went offline
            delete this.config.liveStreams[key];
            await this.saveConfig();
            
            logger.info(`🌌 ${username} has ended their stream on ${platform}`);
            
            // Send stream ended notification
            await this.sendStreamEndedNotifications(platform, username, wasLive);
        }
    }

    // Send live notifications to all relevant channels
    async sendLiveNotifications(platform, username, streamData) {
        const key = `${platform}:${username}`;
        const streamerConfig = this.config.streamers[key];
        
        if (!streamerConfig) return;

        const channelIds = Object.values(streamerConfig.guilds);
        
        if (channelIds.length > 0) {
            await this.bot.sendLiveNotification(platform, streamData, channelIds);
        }
    }

    // Send stream ended notifications
    async sendStreamEndedNotifications(platform, username, streamData) {
        const key = `${platform}:${username}`;
        const streamerConfig = this.config.streamers[key];
        
        if (!streamerConfig) return;

        const channelIds = Object.values(streamerConfig.guilds);
        
        if (channelIds.length > 0) {
            await this.bot.sendStreamEndedNotification(platform, streamData, channelIds);
        }
    }

    // Check YouTube uploads
    async checkYouTubeUploads(identifiers) {
        try {
            const youtubeService = require('./youtubeService');
            const recentUploads = await youtubeService.getMultipleRecentUploads(identifiers);
            
            for (const upload of recentUploads) {
                await this.handleUploadNotification('youtube', upload.username, upload);
            }
        } catch (error) {
            logger.error('Error checking YouTube uploads:', error);
        }
    }

    // Handle upload notifications
    async handleUploadNotification(platform, username, uploadData) {
        const key = `${platform}:${username}:${uploadData.url}`;
        
        // Check if we've already notified about this upload
        if (this.config.notifiedUploads[key]) {
            return;
        }

        // Mark as notified
        this.config.notifiedUploads[key] = {
            notifiedAt: Date.now(),
            title: uploadData.title,
            publishedAt: uploadData.publishedAt
        };

        await this.saveConfig();
        await this.sendUploadNotifications(platform, username, uploadData);
        
        logger.info(`🎬 ${username} uploaded a new video on ${platform}: ${uploadData.title}`);
    }

    // Send upload notifications to all relevant channels
    async sendUploadNotifications(platform, username, uploadData) {
        const key = `${platform}:${username}`;
        const streamerConfig = this.config.streamers[key];
        
        if (!streamerConfig) return;

        const channelIds = Object.values(streamerConfig.guilds);
        
        if (channelIds.length > 0) {
            await this.bot.sendUploadNotification(platform, uploadData, channelIds);
        }
    }
}

module.exports = new StreamMonitor();
