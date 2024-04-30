import GenerateButton from '@/components/generateButton'
import VideoPlayer from '@/components/videoPlayer'
import '../app/globals.css'
import { useEffect, useState } from 'react'
import axios from 'axios'

const HomePage = () => {
  const [twitchCategory, setTwitchCategory] = useState('')
  const [clipCount, setClipCount] = useState('')
  const [uploadToYoutube, setUploadToYoutube] = useState(false)
  const [videoSource, setVideoSource] = useState(null)
  const [videoPath, setVideoPath] = useState(null)
  const [isVideoGenerated, setIsVideoGenerated] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authorizationUrl, setAuthorizationUrl] = useState(null)
  const [hasAccessToken, setHasAccessToken] = useState(false)

  useEffect(() => {
    fetchAuthorizationUrl()
    checkAccessToken()
    console.log(isAuthenticated)
  }, [])

  useEffect(() => {
    const accessToken = localStorage.getItem('hasAccessToken')
    setHasAccessToken(accessToken === 'true')
    console.log('hasAcceasToken is: ' + hasAccessToken)
  }, [])

  const handleTwitchCategoryChange = (e) => {
    setTwitchCategory(e.target.value)
  }

  const handleClipCountChange = (e) => {
    const count = Math.min(parseInt(e.target.value, 10) || 0, 20)
    setClipCount(count)
  }

  const handleUploadToYoutubeChange = () => {
    setUploadToYoutube(!uploadToYoutube)
  }

  const handleVideoGenerated = (videoUrl, videoPath) => {
    setVideoSource(videoUrl)
    setVideoPath(videoPath)
    setIsVideoGenerated(true)
  }

  const fetchAuthorizationUrl = async () => {
    try {
      const response = await axios.get('/api/checkAccessToken');
      setAuthorizationUrl(response.data.authorizationUrl);
    } catch (error) {
      console.error('Error fetching authorization URL:', error);
    }
  };

  const checkAccessToken = async () => {
    const response = await axios.get('api/checkAccessToken')
    setIsAuthenticated(response.data.hasAccessToken)
    localStorage.setItem('hasAccessToken', response.data.hasAccessToken.toString())
  };

  const handleSignInYoutube = () => {
    window.location.href = authorizationUrl
  }

  const getHasAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasAccessToken') === 'true';
    }
    return false;
  };

  const renderAuthButton = () => {
    const hasAccessToken = getHasAccessToken();

    if (hasAccessToken) {
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={uploadToYoutube}
            onChange={handleUploadToYoutubeChange}
            className="mr-2"
          />
          <label>Upload to YouTube?</label>
        </div>
      );
    } else {
      return <button onClick={handleSignInYoutube}>Sign in to YouTube</button>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">TwitchTrim</h1>
      <div className="mb-8 w-3/4">
        <VideoPlayer videoSource={videoSource} />
      </div>
      <input
        type="text"
        placeholder="Twitch Category"
        value={twitchCategory}
        onChange={handleTwitchCategoryChange}
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="Number of Clips"
        value={clipCount}
        onChange={handleClipCountChange}
        min="1"
        max="20"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />    
        
      {hasAccessToken ? (
        <div className="flex items-center">
        <input
          type="checkbox"
          checked={uploadToYoutube}
          onChange={handleUploadToYoutubeChange}
          className="mr-2"
        />
        <label>Upload to YouTube?</label>
      </div>
      ) : (
        <button onClick={handleSignInYoutube}>Sign in to YouTube</button>
      )}
      <div className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-8">
        <GenerateButton
          twitchCategory={twitchCategory}
          clipCount={clipCount}
          uploadToYoutube={uploadToYoutube}
          onVideoGenerated={handleVideoGenerated}
        />
      </div>

      <div className="w-3/4 mb-8">
        <h2 className="text-2xl font-bold mb-4">About TwitchTrim</h2>
        <p className="text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sed
          nisi dolor. Sed euismod, nisl vel tincidunt lacinia, nisl nisl aliquam
          nisl, eget aliquam nisl nisl eget nisl. Sed euismod, nisl vel
          tincidunt lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl eget
          nisl.
        </p>
      </div>

      <div className="w-3/4">
        <p className="text-gray-700">
          Dummy text goes here. Sed euismod, nisl vel tincidunt lacinia, nisl
          nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Sed euismod, nisl
          vel tincidunt lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl
          eget nisl.
        </p>
      </div>
    </div>
  )
}

export default HomePage
