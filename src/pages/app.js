import getTopClipsOfTheWeek from './api/twitchFetcher.js'
import createVideoFromClips from './api/videoEditor.js'
import uploadVideoToYoutube from './api/youtubeUploader.js'
import config from '../../config.js'

async function runApp() {
  const {
    twitch: {
      clipSettings: { category },
    },
  } = config
  const clips = await getTopClipsOfTheWeek()
  const outputVideoPath = await createVideoFromClips(clips)
  // const categoryName = category.name
  // uploadVideoToYoutube(outputVideoPath, categoryName)
}

runApp()
