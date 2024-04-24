import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'
import getOAuth2Client from '../../utils/auth'

const YOUTUBE_API_VERSION = 'v3'

export default async function handler(req, res) {
  try {
    const { videoPath, categoryName } = req.body

    console.log('Uploading video to YouTube...')

    const oauth2Client = await getOAuth2Client()
    const youtube = google.youtube({
      version: YOUTUBE_API_VERSION,
      auth: oauth2Client,
    })

    const videoFilePath = path.resolve(videoPath)

    const videoMetadata = {
      snippet: {
        title: `Top Twitch Clips of the Week - ${categoryName}`,
        description: 'A compilation of the top clips from Twitch this week.',
        categoryId: 20,
      },
      status: {
        privacyStatus: 'private',
      },
    }

    await youtube.videos.insert({
      part: 'snippet, status',
      notifySubscribers: false,
      requestBody: videoMetadata,
      media: {
        body: fs.createReadStream(videoFilePath),
        mimeType: 'video/mp4',
        chunkSize: 1024 * 1024 * 10,
      },
    })

    console.log('Video upload complete')

    res.status(200).json({ message: 'Video upload successful' })
  } catch (error) {
    console.error('Error uploading video to YouTube:', error)
    res.status(500).json({ error: 'Failed to upload video to YouTube' })
  }
}