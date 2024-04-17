import axios from 'axios'
import config from './config.js'

async function getTopClipsOfTheWeek() {
  console.log('Gathering clips...')
  const {
    twitch: { clientId, accessToken, clipSettings },
  } = config
  const { count, category, startDate, endDate } = clipSettings

  const startDateString = startDate.toISOString().split('T')[0]
  const endDateString = endDate.toISOString().split('T')[0]

  const params = {
    game_id: category.id,
    first: count,
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

  return response.data
}

export default getTopClipsOfTheWeek
