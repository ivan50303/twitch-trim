import getTopClipsOfTheWeek from './twitchFetcher.js'
import createVideoFromClips from './videoEditor.js'
import uploadVideoToYoutube from './youtubeUploader.js'

async function runApp() {
  const clips = await getTopClipsOfTheWeek()
  const outputVideoPath = await createVideoFromClips(clips)
  await uploadVideoToYoutube(outputVideoPath)
  console.log('Video upload complete.')
}

runApp()
