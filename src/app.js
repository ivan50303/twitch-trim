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
  const outputVideoPath = await createVideoFromClips(clips)
  console.log(outputVideoPath);
  //const categoryName = category.name

  //await uploadVideoToYoutube(outputVideoPath, categoryName)
  //console.log('Video upload complete.')
}

runApp()
