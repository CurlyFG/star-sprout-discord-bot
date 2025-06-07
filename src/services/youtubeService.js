const axios = require('axios');
const logger = require('../utils/logger');

class YouTubeService {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY_NEW || process.env.YOUTUBE_API_KEY;
        this.baseURL = 'https://www.googleapis.com/youtube/v3';
    }

    // Get channel ID from username or handle
    async getChannelId(identifier) {
        try {
            let response;
            
            // Try as channel handle first (starts with @)
            if (identifier.startsWith('@')) {
                response = await axios.get(`${this.baseURL}/channels`, {
                    params: {
                        part: 'id',
                        forHandle: identifier.substring(1), // Remove @ symbol for API
                        key: this.apiKey
                    }
                });
            } else {
                // Try as username
                response = await axios.get(`${this.baseURL}/channels`, {
                    params: {
                        part: 'id',
                        forUsername: identifier,
                        key: this.apiKey
                    }
                });
            }

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`YouTube channel '${identifier}' not found`);
            }

            return response.data.items[0].id;
        } catch (error) {
            logger.error(`Error getting YouTube channel ID for ${identifier}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Check if channel is live
    async isChannelLive(identifier) {
        try {
            const channelId = await this.getChannelId(identifier);

            // Search for live streams from this channel
            const searchResponse = await axios.get(`${this.baseURL}/search`, {
                params: {
                    part: 'id,snippet',
                    channelId: channelId,
                    eventType: 'live',
                    type: 'video',
                    key: this.apiKey
                }
            });

            if (searchResponse.data.items.length === 0) {
                return null; // Not live
            }

            const liveVideo = searchResponse.data.items[0];
            
            // Get detailed video information
            const videoResponse = await axios.get(`${this.baseURL}/videos`, {
                params: {
                    part: 'snippet,liveStreamingDetails,statistics',
                    id: liveVideo.id.videoId,
                    key: this.apiKey
                }
            });

            if (videoResponse.data.items.length === 0) {
                return null;
            }

            const videoData = videoResponse.data.items[0];
            const snippet = videoData.snippet;
            const liveDetails = videoData.liveStreamingDetails;

            return {
                platform: 'youtube',
                username: identifier,
                displayName: snippet.channelTitle,
                title: snippet.title,
                category: snippet.categoryId ? await this.getCategoryName(snippet.categoryId) : 'Unknown',
                viewers: liveDetails.concurrentViewers ? parseInt(liveDetails.concurrentViewers) : 0,
                startedAt: liveDetails.actualStartTime,
                thumbnail: snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
                url: `https://www.youtube.com/watch?v=${liveVideo.id.videoId}`
            };
        } catch (error) {
            logger.error(`Error checking if ${identifier} is live on YouTube:`, error.message);
            return null;
        }
    }

    // Get category name by ID
    async getCategoryName(categoryId) {
        try {
            const response = await axios.get(`${this.baseURL}/videoCategories`, {
                params: {
                    part: 'snippet',
                    id: categoryId,
                    key: this.apiKey
                }
            });

            if (response.data.items.length > 0) {
                return response.data.items[0].snippet.title;
            }
            
            return 'Unknown Category';
        } catch (error) {
            logger.warn(`Error getting YouTube category name for ID ${categoryId}:`, error.message);
            return 'Unknown Category';
        }
    }

    // Check for recent uploads (within last 24 hours)
    async getRecentUploads(identifier, maxResults = 5) {
        try {
            const channelId = await this.getChannelId(identifier);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const response = await axios.get(`${this.baseURL}/search`, {
                params: {
                    part: 'id,snippet',
                    channelId: channelId,
                    type: 'video',
                    order: 'date',
                    publishedAfter: oneDayAgo,
                    maxResults: maxResults,
                    key: this.apiKey
                }
            });

            const uploads = [];
            for (const video of response.data.items) {
                const videoResponse = await axios.get(`${this.baseURL}/videos`, {
                    params: {
                        part: 'snippet,statistics',
                        id: video.id.videoId,
                        key: this.apiKey
                    }
                });

                if (videoResponse.data.items.length > 0) {
                    const videoData = videoResponse.data.items[0];
                    uploads.push({
                        platform: 'youtube',
                        type: 'upload',
                        username: identifier,
                        displayName: video.snippet.channelTitle,
                        title: video.snippet.title,
                        description: video.snippet.description.substring(0, 200) + '...',
                        publishedAt: video.snippet.publishedAt,
                        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
                        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                        views: videoData.statistics.viewCount || '0',
                        duration: videoData.contentDetails?.duration || 'Unknown'
                    });
                }
            }

            return uploads;
        } catch (error) {
            logger.error(`Error getting recent uploads for ${identifier}:`, error.message);
            return [];
        }
    }

    // Get multiple live streams at once
    async getMultipleLiveStreams(identifiers) {
        const streams = [];
        
        for (const identifier of identifiers) {
            try {
                const stream = await this.isChannelLive(identifier);
                if (stream) {
                    streams.push(stream);
                }
            } catch (error) {
                logger.warn(`Skipping invalid YouTube channel: ${identifier}`);
            }
        }

        return streams;
    }

    // Get multiple recent uploads at once
    async getMultipleRecentUploads(identifiers) {
        const allUploads = [];
        
        for (const identifier of identifiers) {
            try {
                const uploads = await this.getRecentUploads(identifier, 3);
                allUploads.push(...uploads);
            } catch (error) {
                logger.warn(`Skipping uploads check for invalid YouTube channel: ${identifier}`);
            }
        }

        return allUploads;
    }
}

module.exports = new YouTubeService();
