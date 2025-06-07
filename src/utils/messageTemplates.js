const logger = require('./logger');

class MessageTemplates {
    // Get live stream template based on platform
    getLiveTemplate(platform, streamerData) {
        switch (platform.toLowerCase()) {
            case 'twitch':
                return this.getTwitchTemplate(streamerData);
            case 'youtube':
                return this.getYouTubeTemplate(streamerData);
            default:
                return this.getGenericTemplate(streamerData);
        }
    }

    // Twitch live notification template
    getTwitchTemplate(streamerData) {
        const glowPhrases = [
            'A new bloom unfurls in the glade...',
            'The starlight stirs, and petals gleam...',
            'Something radiant takes root...',
            'A gentle glow awakens...',
            'The realm shimmers with new light...'
        ];

        const endPhrases = [
            'The Star Sprout has awakened... the realm stirs.',
            'A bloom of presence... don\'t miss the moment.',
            'The glow beckons... follow the light.',
            'Something beautiful unfolds... step closer.',
            'The bloom pulses with gentle radiance.'
        ];

        const randomGlow = glowPhrases[Math.floor(Math.random() * glowPhrases.length)];
        const randomEnd = endPhrases[Math.floor(Math.random() * endPhrases.length)];

        return {
            title: '🟣 New Bloom on Twitch',
            content: `🌱 ${randomGlow}`,
            description: `**${streamerData.displayName || streamerData.username}** is now LIVE on Twitch!\n\n${randomEnd}`,
        };
    }

    // YouTube live notification template
    getYouTubeTemplate(streamerData) {
        const glowPhrases = [
            'The stars shiver, and a bloom glows bright...',
            'A radiant flower opens to the light...',
            'The cosmos whispers, and petals unfurl...',
            'Something celestial stirs in the grove...',
            'The ethereal bloom awakens...'
        ];

        const endPhrases = [
            'A bloom of presence... don\'t miss the moment.',
            'The light unfolds before you... step into it.',
            'The Star Sprout glimmers with anticipation.',
            'A moment of magic begins... witness it.',
            'The realm brightens with gentle luminescence.'
        ];

        const randomGlow = glowPhrases[Math.floor(Math.random() * glowPhrases.length)];
        const randomEnd = endPhrases[Math.floor(Math.random() * endPhrases.length)];

        return {
            title: '🔴 New Bloom on YouTube',
            content: `🌿 ${randomGlow}`,
            description: `**${streamerData.displayName || streamerData.username}** is LIVE on YouTube!\n\n${randomEnd}`,
        };
    }

    // Generic template for other platforms
    getGenericTemplate(streamerData) {
        return {
            title: '✨ New Stream Detected',
            content: '🌱 A gentle bloom stirs...',
            description: `**${streamerData.displayName || streamerData.username}** is now live!\n\nThe Star Sprout senses radiant energy...`,
        };
    }

    // Get introduction message
    getIntroMessage(guildName) {
        return {
            title: '🌱 A soft rustle in the roots...',
            description: `Hello, friends of ${guildName}.\n\nI am **Star Sprout**, and I bloom only when something radiant takes root.\n\nWhenever someone goes LIVE, I will gently shine the path for you to follow.\n\n🌿 Stay close to the glow.`,
            footer: 'Star Sprout • Realm Notifier'
        };
    }

    // Get help message
    getHelpMessage() {
        return {
            title: '🌿 Star Sprout Commands',
            description: 'Here are the gentle commands to tend the bloom:',
            fields: [
                {
                    name: '🌱 `!sprout add <platform> <username>`',
                    value: 'Add a streamer to watch (twitch/youtube)',
                    inline: false
                },
                {
                    name: '🥀 `!sprout remove <platform> <username>`',
                    value: 'Remove a streamer from watching',
                    inline: false
                },
                {
                    name: '📋 `!sprout list`',
                    value: 'List all watched streamers and their channels',
                    inline: false
                },
                {
                    name: '🎯 `!sprout channel <#channel>`',
                    value: 'Set default notification channel for this server',
                    inline: false
                },
                {
                    name: '🌿 `!sprout move <platform> <username> <#channel>`',
                    value: 'Move a specific streamer to a different channel',
                    inline: false
                },
                {
                    name: '🌸 `!sprout intro`',
                    value: 'Send introduction message',
                    inline: false
                }
            ],
            footer: 'Star Sprout • Gentle Commands for the Bloom'
        };
    }

    // Get error messages with theme
    getErrorMessage(type, details = '') {
        const errorMessages = {
            'permission': {
                title: '🥀 The bloom withers...',
                description: 'You need administrator permissions to tend the Star Sprout.',
            },
            'invalid_platform': {
                title: '🥀 The seeds won\'t take root...',
                description: 'Please choose a valid platform: `twitch` or `youtube`',
            },
            'invalid_username': {
                title: '🥀 The bloom cannot find this soul...',
                description: `The username "${details}" could not be found on this platform.`,
            },
            'no_channel': {
                title: '🥀 No sacred grove is set...',
                description: 'Please set a notification channel first using `!sprout channel #channel-name`',
            },
            'generic': {
                title: '🥀 The bloom encounters shadow...',
                description: details || 'Something went wrong. The Star Sprout will try again soon.',
            }
        };

        return errorMessages[type] || errorMessages['generic'];
    }

    // Get success messages with theme
    getSuccessMessage(type, details = '') {
        const successMessages = {
            'streamer_added': {
                title: '🌱 A new soul joins the watch...',
                description: `The bloom now watches for **${details}** to awaken.`,
            },
            'streamer_removed': {
                title: '🌸 The watch gently releases...',
                description: `The bloom no longer watches **${details}**.`,
            },
            'channel_set': {
                title: '🌿 The sacred grove is chosen...',
                description: `Notifications will bloom in ${details}`,
            },
            'generic': {
                title: '✨ The bloom glows with success...',
                description: details || 'The task is complete.',
            }
        };

        return successMessages[type] || successMessages['generic'];
    }
}

module.exports = new MessageTemplates();
