# Star Sprout Discord Bot - Deployment Guide

## Quick Fix for Build Error (Exit Code 127)

The deployment configuration has been updated to resolve the build issues:

### Updated Files:
- `render.yaml` - Fixed build command and Node.js configuration
- `Procfile` - Added as backup deployment method

### Deployment Steps:

1. **Redeploy on Render:**
   - Go to your Render dashboard
   - Find your `star-sprout-bot` service
   - Click "Manual Deploy" → "Deploy latest commit"

2. **Environment Variables (Required):**
   ```
   DISCORD_BOT_TOKEN=your_bot_token
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   YOUTUBE_API_KEY_NEW=your_fresh_youtube_key
   NODE_ENV=production
   ```

3. **Alternative: Create New Service:**
   If rebuild fails, create a new web service:
   - Select your GitHub repository
   - Render will auto-detect the configuration
   - Choose "Free" plan
   - Add environment variables
   - Deploy

### Features Ready:
- ✅ Twitch live stream monitoring
- ✅ YouTube live stream monitoring  
- ✅ YouTube upload notifications
- ✅ Multi-server Discord support
- ✅ Themed notification messages

The bot will automatically monitor streams every 2 minutes and send notifications to your Discord channels.