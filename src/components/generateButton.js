import { useState, useRef, useEffect } from 'react'
import gameInfo from '../../public/game_info.json' assert { type: 'json' }
import axios from 'axios'

const GenerateButton = ({
  twitchCategory,
  clipCount,
  uploadToYoutube,
  onVideoGenerated,
  onAuthenticationComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVideoGenerated, setIsVideoGenerated] = useState(false)
  const [authorizationUrl, setAuthorizationUrl] = useState(null)
  const [hasAccessToken, setHasAccessToken] = useState(false)
  const videoPlayerRef = useRef(null)

  useEffect(() => {
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
    if (hasToken === 'true') {
      onAuthenticationComplete()
    }
  }, [onAuthenticationComplete])

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
        localStorage.setItem('hasAccessToken', 'true')
        setHasAccessToken(true)
      }
    } catch (error) {
      console.error('Error storing access token:', error);
    }
  };

  const handleSignInToYoutube = () => {
    window.location.href = authorizationUrl
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
      }
      // if (uploadToYoutube) {
      //   if (!hasAccessToken && authorizationUrl) {
      //     window.location.href = authorizationUrl;
      //   } else {
      //     const searchParams = new URLSearchParams(window.location.search);
      //     const authorizationCode = searchParams.get('code');
  
      //     if (authorizationCode) {
      //       try {
      //         await axios.post('/api/storeAccessToken', { code: authorizationCode });
      //         console.log('Access token stored successfully');
  
      //         const categoryName = 'category_name'; // Replace with category name
      //         const uploadResponse = await axios.post('/api/youtubeUploader', {
      //           videoPath,
      //           categoryName,
      //         });
  
      //         if (uploadResponse.status === 200) {
      //           console.log('Video uploaded successfully!');
      //         } else {
      //           console.error('Error uploading video');
      //         }
      //       } catch (error) {
      //         console.error('Error storing access token:', error);
      //       }
      //     } else {
      //       console.log('No authorization code found');
      //     }
      //   }
      // }
    } catch (error) {
      console.error('Error generating video:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      {!hasAccessToken &&  (
    <button onClick={handleSignInToYoutube}>Sign in to YouTube</button>
  )}
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Generate'}
    </button>
    </div>
  )
}

export default GenerateButton
