import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const config = {
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    accessToken: process.env.TWITCH_ACCESS_TOKEN,
    clipSettings: {
      broadcasterId: '',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
  },
}

export default config
