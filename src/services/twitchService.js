const axios = require('axios');
const logger = require('../utils/logger');

class TwitchService {
    constructor() {
        this.clientId = process.env.TWITCH_CLIENT_ID;
        this.clientSecret = process.env.TWITCH_CLIENT_SECRET;
        this.accessToken = null;
        this.tokenExpiry = null;
        this.baseURL = 'https://api.twitch.tv/helix';
    }

    // Get OAuth access token
    async getAccessToken() {
        try {
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                params: {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'client_credentials'
                }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 minute early

            logger.info('🌱 Twitch access token refreshed');
            return this.accessToken;
        } catch (error) {
            logger.error('Error getting Twitch access token:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get user ID from username
    async getUserId(username) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(`${this.baseURL}/users`, {
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    login: username
                }
            });

            if (response.data.data.length === 0) {
                throw new Error(`Twitch user '${username}' not found`);
            }

            return response.data.data[0].id;
        } catch (error) {
            logger.error(`Error getting Twitch user ID for ${username}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Check if user is live
    async isUserLive(username) {
        try {
            const userId = await this.getUserId(username);
            const token = await this.getAccessToken();

            const response = await axios.get(`${this.baseURL}/streams`, {
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    user_id: userId
                }
            });

            if (response.data.data.length === 0) {
                return null; // Not live
            }

            const streamData = response.data.data[0];
            
            // Get game/category name
            let gameName = 'Unknown Category';
            if (streamData.game_id && streamData.game_id !== '0') {
                try {
                    const gameResponse = await axios.get(`${this.baseURL}/games`, {
                        headers: {
                            'Client-ID': this.clientId,
                            'Authorization': `Bearer ${token}`
                        },
                        params: {
                            id: streamData.game_id
                        }
                    });
                    
                    if (gameResponse.data.data.length > 0) {
                        gameName = gameResponse.data.data[0].name;
                    }
                } catch (gameError) {
                    logger.warn(`Error fetching game name for ID ${streamData.game_id}:`, gameError.message);
                }
            }

            return {
                platform: 'twitch',
                username: streamData.user_login,
                displayName: streamData.user_name,
                title: streamData.title,
                game: gameName,
                viewers: streamData.viewer_count,
                startedAt: streamData.started_at,
                thumbnail: streamData.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
                url: `https://twitch.tv/${streamData.user_login}`
            };
        } catch (error) {
            logger.error(`Error checking if ${username} is live on Twitch:`, error.message);
            return null;
        }
    }

    // Get multiple streams at once
    async getMultipleStreams(usernames) {
        try {
            const token = await this.getAccessToken();
            
            // Get user IDs
            const userIds = [];
            for (const username of usernames) {
                try {
                    const userId = await this.getUserId(username);
                    userIds.push(userId);
                } catch (error) {
                    logger.warn(`Skipping invalid Twitch user: ${username}`);
                }
            }

            if (userIds.length === 0) {
                return [];
            }

            const response = await axios.get(`${this.baseURL}/streams`, {
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    user_id: userIds
                }
            });

            const streams = [];
            for (const streamData of response.data.data) {
                // Get game name
                let gameName = 'Unknown Category';
                if (streamData.game_id && streamData.game_id !== '0') {
                    try {
                        const gameResponse = await axios.get(`${this.baseURL}/games`, {
                            headers: {
                                'Client-ID': this.clientId,
                                'Authorization': `Bearer ${token}`
                            },
                            params: {
                                id: streamData.game_id
                            }
                        });
                        
                        if (gameResponse.data.data.length > 0) {
                            gameName = gameResponse.data.data[0].name;
                        }
                    } catch (gameError) {
                        logger.warn(`Error fetching game name for ID ${streamData.game_id}:`, gameError.message);
                    }
                }

                streams.push({
                    platform: 'twitch',
                    username: streamData.user_login,
                    displayName: streamData.user_name,
                    title: streamData.title,
                    game: gameName,
                    viewers: streamData.viewer_count,
                    startedAt: streamData.started_at,
                    thumbnail: streamData.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
                    url: `https://twitch.tv/${streamData.user_login}`
                });
            }

            return streams;
        } catch (error) {
            logger.error('Error getting multiple Twitch streams:', error.message);
            return [];
        }
    }
}

module.exports = new TwitchService();
