import { useState } from 'react'

const GenerateButton = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      // Fetch clips from Twitch
      const twitchClipsResponse = await fetch('/api/twitchFetcher')
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
      const categoryName = 'your_category_name' // Replace with your category name
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
