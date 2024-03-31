import dotenv from 'dotenv'

import { ApiClient } from 'twitch'
import { StaticAuthProvider } from 'twitch-auth'

const env = dotenv.config({ path: '../.env' }).parsed

const clientId = env.TWITCH_CLIENT_ID
const accessToken = env.TWITCH_ACCESS_TOKEN
const authProvider = new StaticAuthProvider(clientId, accessToken)
const apiClient = new ApiClient({ authProvider })
const game = await apiClient.helix.games.getGameByName('Just Chatting')

async function getGameClips(gameId) {
  return await apiClient.helix.clips.getClipsForGame(gameId)
}

getGameClips(game.id).then((data) => {
  console.log(data)
})
