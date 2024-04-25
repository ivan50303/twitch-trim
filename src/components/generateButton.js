import { useState } from 'react'
import gameInfo from '../../public/game_info.json' assert { type: 'json' }

const GenerateButton = ({ twitchCategory, clipCount }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const getCategoryId = (categoryName) => {
    const category = gameInfo.find(
      (game) => game.name.toLowerCase() === categoryName.toLowerCase().trim()
    )
    return category ? category.id : null
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const categoryId = getCategoryId(twitchCategory)
      console.log(categoryId)
      if (!categoryId) {
        console.error('Invalid Twitch category')
        return
      }

      // Fetch clips from Twitch
      const twitchClipsResponse = await fetch('/api/twitchFetcher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, clipCount }),
      })
      const twitchClips = await twitchClipsResponse.json()

      // Edit the clips into a video
      const editedVideoResponse = await fetch('/api/videoEditor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: twitchClips }),
      })
      const { videoPath } = await editedVideoResponse.json()

      // Upload the video to YouTube
      const categoryName = 'category_name' // Replace with category name
      const uploadResponse = await fetch('/api/youtubeUploader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoPath, categoryName }),
      })

      if (uploadResponse.ok) {
        console.log('Video uploaded successfully!')
      } else {
        console.error('Error uploading video')
      }
    } catch (error) {
      console.error('Error generating video:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Generate'}
    </button>
  )
}

export default GenerateButton
