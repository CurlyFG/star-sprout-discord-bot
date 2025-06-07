# YouTube API Setup for Star Sprout

## Current Status
YouTube monitoring is fully implemented but currently disabled due to API quota limits. This guide will help you enable it after deployment.

## To Enable YouTube Monitoring:

### Option 1: Wait for Quota Reset
- YouTube API quotas reset daily at midnight Pacific Time
- After reset, use the bot command: `/add youtube @curlyfitgamer`

### Option 2: Create Fresh API Key
1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a NEW project (don't use existing one)
3. Enable YouTube Data API v3
4. Create credentials → API key
5. Update the `YOUTUBE_API_KEY_NEW` environment variable in Render

## Features Ready:
- Live stream notifications for YouTube
- Upload notifications for new videos (last 24 hours)
- Embedded messages with thumbnails, view counts, descriptions
- Same multi-channel support as Twitch

## Commands Available:
- `/add youtube @curlyfitgamer` - Add your channel
- `/remove youtube @curlyfitgamer` - Remove monitoring
- `/list` - View all monitored channels
- `/move youtube @curlyfitgamer #new-channel` - Change notification channel

Your YouTube channel will receive the same beautiful themed notifications as Twitch streams.