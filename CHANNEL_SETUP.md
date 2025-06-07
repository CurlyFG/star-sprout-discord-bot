# YouTube Channel Separation Setup

I've added support for separate Discord channels for YouTube live streams vs uploads.

## New Slash Commands Available:

### `/setlivechannel`
Sets where live stream notifications go
- Platform: youtube or twitch
- Username: @curlyfitgamer  
- Channel: Your live streams Discord channel

### `/setuploadchannel` 
Sets where upload notifications go
- Platform: youtube (only)
- Username: @curlyfitgamer
- Channel: Your uploads Discord channel

## Example Usage:

1. **Set live streams to go to #live-streams:**
   `/setlivechannel youtube @curlyfitgamer #live-streams`

2. **Set uploads to go to #new-videos:**
   `/setuploadchannel youtube @curlyfitgamer #new-videos`

## Current Configuration:
Both live streams and uploads currently go to the same channel. Use the commands above to separate them.

## Features:
- Live stream notifications show when you go live on YouTube
- Upload notifications show when you publish new videos (last 24 hours)
- Different themed messages for each type
- Full backward compatibility with existing setup