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
  const [authorizationUrl, setAuthorizationUrl] = useState(null)
  const [hasAccessToken, setHasAccessToken] = useState(false)

  useEffect(() => {
    fetchAuthorizationUrl()
    checkAccessToken()
  }, [])

  useEffect(() => {
    const accessToken = localStorage.getItem('hasAccessToken')
    setHasAccessToken(accessToken === 'true')
  }, [])

  const handleTwitchCategoryChange = (e) => {
    setTwitchCategory(e.target.value)
  }

  const handleClipCountChange = (e) => {
    const count = Math.min(parseInt(e.target.value, 10) || 1, 10)
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
      const response = await axios.get('/api/checkAccessToken')
      setAuthorizationUrl(response.data.authorizationUrl)
    } catch (error) {
      console.error('Error fetching authorization URL:', error)
    }
  }

  const checkAccessToken = async () => {
    const response = await axios.get('api/checkAccessToken')
    localStorage.setItem(
      'hasAccessToken',
      response.data.hasAccessToken.toString()
    )
  }

  const handleSignInYoutube = () => {
    window.location.href = authorizationUrl
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-twitch-gray-dark">
      <h1 className="text-4xl font-bold mb-8">TwitchTrim</h1>

      <div className="mb-8 w-3/4">
        <VideoPlayer videoSource={videoSource} />
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Twitch Category"
          value={twitchCategory}
          onChange={handleTwitchCategoryChange}
          className="px-4 py-2 mb-1 block border border-twitch-gray-light rounded focus:outline-none focus:ring-2 focus:ring-twitch-purple-light"
        />
        <input
          type="text"
          placeholder="Number of Clips"
          value={clipCount}
          onChange={handleClipCountChange}
          min="1"
          max="10"
          className="px-4 py-2 border border-twitch-gray-light rounded focus:outline-none focus:ring-2 focus:ring-twitch-purple-light"
        />
      </div>

      {hasAccessToken ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={uploadToYoutube}
            onChange={handleUploadToYoutubeChange}
            className="mr-2 text-twitch-gray-dark"
          />
          <label>Upload to YouTube?</label>
        </div>
      ) : (
        <button
          onClick={handleSignInYoutube}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign in to YouTube
        </button>
      )}

      <div className="bg-twitch-purple-light hover:bg-twitch-purple-dark text-white font-bold py-2 px-4 rounded mb-8 mt-2">
        <GenerateButton
          twitchCategory={twitchCategory}
          clipCount={clipCount}
          uploadToYoutube={uploadToYoutube}
          onVideoGenerated={handleVideoGenerated}
        />
      </div>

      <div className="w-3/4 mb-8">
        <h2 className="text-2xl font-bold mb-4">About TwitchTrim</h2>
        <p>
          Discover a revolutionary way to create and share Twitch highlight
          videos with TwitchTrim. Our innovative web application seamlessly
          integrates with the Twitch API to fetch the most exciting and
          memorable moments from your favorite Twitch categories. Simply choose
          your desired category, select the number of clips you want to include,
          and let our intelligent algorithms do the rest. TwitchTrim carefully
          curates and edits the clips, crafting a polished and entertaining
          video that captures the essence of Twitch action, saving you valuable
          time and effort.
        </p>
      </div>

      <div className="w-3/4 mb-8">
        <p>
          TwitchTrim goes beyond just video generation. With our seamless
          YouTube integration, you can effortlessly upload your created
          highlight videos directly to your YouTube channel, sharing your Twitch
          experiences with the world and growing your online presence.
        </p>
      </div>

      <div className="w-3/4">
        <p>Experience the future of Twitch highlight videos with TwitchTrim.</p>
      </div>
    </div>
  )
}

export default HomePage
