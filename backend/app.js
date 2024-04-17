import getTopClipsOfTheWeek from './twitchFetcher.js'
import createVideoFromClips from './videoEditor.js'
import uploadVideoToYoutube from './youtubeUploader.js'
import config from './config.js'

async function runApp() {
  const {
    twitch: {
      clipSettings: { category },
    },
  } = config

  const clips = await getTopClipsOfTheWeek()
  console.log('done')
  const outputVideoPath = await createVideoFromClips(clips)
  const categoryName = category.name
  uploadVideoToYoutube(outputVideoPath, categoryName)
}

runApp()
