# Deploying Star Sprout to Render

This guide will help you deploy Star Sprout to Render for 24/7 hosting.

## Prerequisites

1. A GitHub account
2. A Render account (free at render.com)
3. Your API keys ready:
   - Discord Bot Token
   - Twitch Client ID and Secret
   - YouTube API Key

## Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Clone this project or upload the files
3. Push all files to your GitHub repository

## Step 2: Connect to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub account and select your Star Sprout repository

## Step 3: Configure the Service

**Service Settings:**
- Name: `star-sprout-bot`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `node index.js`
- Plan: Free (sufficient for Discord bots)

**Environment Variables:**
Add these in the Environment section:
- `DISCORD_BOT_TOKEN` = your Discord bot token
- `TWITCH_CLIENT_ID` = your Twitch client ID
- `TWITCH_CLIENT_SECRET` = your Twitch client secret
- `YOUTUBE_API_KEY` = your YouTube API key
- `NODE_ENV` = `production`

## Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your bot
3. The bot will be available at `https://your-service-name.onrender.com`

## Health Check

The bot includes health endpoints:
- `/` - Shows bot status and uptime
- `/health` - Health check for monitoring

## Automatic Restarts

Render automatically:
- Restarts your bot if it crashes
- Keeps it running 24/7
- Provides logs for debugging
- Updates when you push to GitHub

## Free Tier Limitations

Render's free tier:
- May sleep after 15 minutes of inactivity
- Limited to 750 hours per month
- Sufficient for most Discord bots

For guaranteed 24/7 uptime, upgrade to a paid plan ($7/month).

## Monitoring

Check your bot status:
1. Visit your Render dashboard
2. View logs in real-time
3. Monitor performance metrics
4. Set up alerts for downtime

Your Star Sprout bot will now run continuously and automatically restart if needed.