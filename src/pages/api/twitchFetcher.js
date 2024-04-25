import axios from 'axios'
import config from '../../../config'

export default async function handler(req, res) {
  try {
    const { categoryId, clipCount } = req.body

    console.log('Gathering clips...')

    const {
      twitch: { clientId, accessToken, clipSettings },
    } = config

    const { count, category, startDate, endDate } = clipSettings

    const startDateString = startDate.toISOString().split('T')[0]
    const endDateString = endDate.toISOString().split('T')[0]

    const params = {
      game_id: categoryId,
      first: clipCount,
      started_at: `${startDateString}T00:00:00Z`,
      ended_at: `${endDateString}T23:59:59Z`,
    }

    const url = 'https://api.twitch.tv/helix/clips'
    const response = await axios.get(url, {
      headers: {
        'CLIENT-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching Twitch clips:', error)
    res.status(500).json({ error: 'Failed to fetch Twitch clips' })
  }
}
