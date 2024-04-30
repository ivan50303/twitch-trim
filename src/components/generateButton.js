import { useState, useRef, useEffect } from 'react'
import gameInfo from '../../public/game_info.json' assert { type: 'json' }
import axios from 'axios'
import { useRouter } from 'next/router'

const GenerateButton = ({
  twitchCategory,
  clipCount,
  uploadToYoutube,
  onVideoGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isVideoGenerated, setIsVideoGenerated] = useState(false)
  const [authorizationUrl, setAuthorizationUrl] = useState(null)
  const [hasAccessToken, setHasAccessToken] = useState(false)

  useEffect(() => {
    console.log('generate button rendered')
    fetchAuthorizationUrl()
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const authorizationCode = searchParams.get('code')
    
    if (authorizationCode) {
      fetchAccessToken(authorizationCode)
    }
  }, [])

  useEffect(() => {
    const hasToken = localStorage.getItem('hasAccessToken')
    setHasAccessToken(hasToken === 'true')
  }, [])

  useEffect(() => {
    let timer;
    if (isDone) {
      timer = setTimeout(() => {
        setIsDone(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isDone]);

  const getCategoryId = (categoryName) => {
    const category = gameInfo.find(
      (game) => game.name.toLowerCase() === categoryName.toLowerCase().trim()
    )
    return category ? category.id : null
  }

  const fetchAuthorizationUrl = async () => {
    try {
      console.log('fetching auth url');
      const response = await axios.get('/api/checkAccessToken');
      console.log(response);
      setHasAccessToken(response.data.hasAccessToken);
      setAuthorizationUrl(response.data.authorizationUrl);
    } catch (error) {
      console.error('Error fetching authorization URL:', error);
    }
  };

  const fetchAccessToken = async (authorizationCode) => {
    try {
      console.log('storing access token');
      const response = await axios.post('/api/storeAccessToken', { code: authorizationCode });
      if (response.status === 200) {
        console.log('setting local storeage true')
        localStorage.setItem('hasAccessToken', 'true')
        setHasAccessToken(true)
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error storing access token:', error);
    }
  };

  const handleGenerate = async () => {
    console.log('run handle generate')
    setIsGenerating(true)
    setIsDone(false)
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

      // Get the generated video file
      const videoBlob = await editedVideoResponse.blob()
      const videoUrl = URL.createObjectURL(videoBlob)

      // Get the videoPath from the response headers
      const videoPath = editedVideoResponse.headers.get('X-Video-Path')

      onVideoGenerated(videoUrl, videoPath)
      setIsVideoGenerated(true)

      if (uploadToYoutube) {
        if (!hasAccessToken) {
          window.location.href = authorizationUrl
          return
        }
          setIsGenerating(false)
          setIsUploading(true)
          
          const categoryName = 'category_name'; // Replace with category name
          const uploadResponse = await axios.post('/api/youtubeUploader', {
            videoPath,
            categoryName,
          });
          if (uploadResponse.status === 200) {
            console.log('Video uploaded successfully!');
          } else {
            console.error('Error uploading video');
          }

          setIsUploading(false)
          setIsDone(true)
      } else {
        setIsGenerating(false)
        setIsDone(true)
      }
    } catch (error) {
      setIsUploading(false)
      console.error('Error generating video:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getButtonLabel = () => {
    if (isGenerating) {
      return 'Generating video...'
    } else if (isUploading) {
      return 'Uploading video...'
    } else if (isDone) {
      return 'Done!'
    } else {
      return 'Generate'
    }
  }

  const isFormFilled = twitchCategory.trim() !== '' && clipCount > 0
  console.log("is form filled: " + isFormFilled)

  return (
    <div>
    <button onClick={handleGenerate} disabled={isGenerating || isUploading || isDone || !isFormFilled}>
      {getButtonLabel()}
    </button>
    </div>
  )
}

export default GenerateButton
