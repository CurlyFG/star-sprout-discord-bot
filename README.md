# 🌱 Star Sprout - Discord Stream Notifier

A gentle Discord bot that monitors Twitch and YouTube streams and sends nature-themed notifications when your favorite streamers go live.

## 🌿 Features

- **Multi-Platform Monitoring**: Watches both Twitch and YouTube streams
- **Beautiful Notifications**: Nature-themed embed messages with stream details
- **Server Management**: Each Discord server can manage its own streamer list
- **Live Status Tracking**: Shows which streamers are currently live
- **Themed Personality**: Star Sprout speaks in gentle, mystical language

## 🌸 Commands

All commands start with `!sprout`:

- `!sprout add <platform> <username>` - Add a streamer to watch (twitch/youtube)
- `!sprout remove <platform> <username>` - Remove a streamer from watching
- `!sprout list` - Show all monitored streamers and their status
- `!sprout channel <#channel>` - Set notification channel for this server
- `!sprout intro` - Send Star Sprout's introduction message
- `!sprout help` - Show all available commands

## 🎯 Setup

1. Create a Discord application and bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Get Twitch API credentials at [Twitch Developers](https://dev.twitch.tv/console/apps)
3. Get YouTube API key from [Google Cloud Console](https://console.cloud.google.com)
4. Set environment variables:
   - `DISCORD_BOT_TOKEN`
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`
   - `YOUTUBE_API_KEY`

## 🌺 Bot Personality

Star Sprout is a mystical bloom from the Dreamwild that awakens only for meaningful moments. It speaks in gentle, nature-themed language and refers to streamers as "souls" and notifications as "blooms."

### Example Messages:
- "🌱 A new bloom unfurls in the glade... **StreamerName** is now LIVE on Twitch!"
- "🌿 The stars shiver, and a bloom glows bright... **StreamerName** is LIVE on YouTube!"
- "🌌 The bloom gently folds its petals... **StreamerName** has ended their stream."

## 🔧 Technical Details

- Built with Discord.js v14
- Monitors streams every 2 minutes
- Persistent configuration storage
- Error handling with themed messages
- Comprehensive logging system

## 🌟 Usage Example

```
!sprout add twitch shroud
!sprout add youtube @PewDiePie
!sprout channel #live-streams
!sprout list
```

Star Sprout will then monitor these streamers and send gentle notifications when they go live in your designated channel.