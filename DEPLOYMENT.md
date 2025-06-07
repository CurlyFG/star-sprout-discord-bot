# Star Sprout Discord Bot - Deployment Guide

## Simplified Deployment (Fix for Exit Code 127)

The build error has been resolved by removing the problematic render.yaml file and using Render's auto-detection.

### Solution Applied:
- Removed `render.yaml` file (was causing Node.js environment conflicts)
- Using `Procfile` for deployment commands
- Letting Render auto-detect Node.js configuration

### New Deployment Steps:

1. **Create Fresh Service on Render:**
   - Go to render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect Node.js project
   - Choose "Free" plan

2. **Configure Environment Variables:**
   ```
   DISCORD_BOT_TOKEN=your_bot_token
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   YOUTUBE_API_KEY_NEW=your_fresh_youtube_key
   NODE_ENV=production
   ```

3. **Build Settings (Auto-detected):**
   - Build Command: `npm install`
   - Start Command: `node index.js` (from Procfile)
   - Node.js Version: Latest stable

### Ready Features:
- Twitch live stream monitoring (curlyfitgamer, erezkigal)
- YouTube live stream monitoring (@curlyfitgamer)
- YouTube upload notifications (last 24 hours)
- Multi-server Discord support
- Themed celestial/nature notification messages

The bot monitors streams every 2 minutes and sends notifications when streamers go live or upload new videos.