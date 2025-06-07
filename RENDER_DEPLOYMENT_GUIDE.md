# Render Deployment Guide - Star Sprout Bot

## Quick Deployment Steps

### 1. Create Web Service
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub account
- Select your `star-sprout-discord-bot` repository

### 2. Service Configuration
- **Name**: `star-sprout-bot`
- **Build Command**: Auto-detected (`npm install`)
- **Start Command**: Auto-detected (`node index.js`)
- **Instance Type**: Free

### 3. Environment Variables (Required)
Add these in the Environment section:

```
DISCORD_BOT_TOKEN=your_discord_bot_token
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
YOUTUBE_API_KEY_NEW=your_fresh_youtube_api_key
NODE_ENV=production
```

### 4. Deploy
- Click "Create Web Service"
- Render will build and deploy automatically
- Takes 2-3 minutes

## Post-Deployment Setup

Once deployed, use these Discord commands to configure separate channels:

### Set Live Stream Channel
```
/setlivechannel youtube @curlyfitgamer #live-streams
```

### Set Upload Channel
```
/setuploadchannel youtube @curlyfitgamer #uploads
```

## Features Ready
- Twitch live stream monitoring (auto-refreshes tokens)
- YouTube live stream monitoring
- YouTube upload notifications (confirmed working)
- Separate channel routing for different content types
- 24/7 monitoring and notifications

The bot will immediately start monitoring and sending notifications once deployed.