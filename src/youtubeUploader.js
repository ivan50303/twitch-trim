import fs from 'fs'
import path from 'path'
import config from './config.js'
import { google } from 'googleapis'

const YOUTUBE_API_VERSION = 'v3'

async function uploadVideoToYoutube(videoFilePath, categoryName) {
  const {
    youtube: { apiKey, channelId, videoCounters },
  } = config

  const youtube = google.youtube({
    version: YOUTUBE_API_VERSION,
    auth: apiKey,
  })

  const videoPath = path.resolve(videoFilePath)

  //Increment video counter for category
  config.youtube.videoCounters[categoryName] =
    (config.youtube.videoCounters[categoryName] || 0) + 1

  const videoCounter = config.youtube.videoCounters[categoryName]

  const videoMetadata = {
    snippet: {
      title: `Top Twitch Clips of the Week - ${categoryName} #${videoCounter}`,
      description: 'A compilation of the top clips from Twitch this week.',
    },
    status: {
      privacyStatus: 'private',
    },
  }

  const res = await youtube.videos.insert({
    part: 'snippet, status',
    notifySubscribers: false,
    requestBody: videoMetadata,
    media: {
      body: fs.createReadStream(videoPath),
      mimeType: 'video/mp4',
      chunkSize: 1024 * 1024 * 10,
    },
    onBehalfOfContentOwnerChannel: channelId,
  })

  console.log(`Video uploaded with ID: ${res.data.id} to channel ${channelId}`)
}

export default uploadVideoToYoutube
