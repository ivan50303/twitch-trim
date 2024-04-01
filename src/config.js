import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const config = {
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    accessToken: process.env.TWITCH_ACCESS_TOKEN,
    clipSettings: {
      count: 20,
      cateogryId: '509658', // Just Chatting
      broadcasterId: '',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    channelId: process.env.YOUTUBE_CHANNEL_ID,
  },
}

export default config
