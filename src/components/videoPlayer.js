import { useRef } from 'react'

const VideoPlayer = ({ videoSource }) => {
  const videoPlayerRef = useRef(null)

  return (
    <div>
      {videoSource && <video ref={videoPlayerRef} src={videoSource} controls />}
    </div>
  )
}

export default VideoPlayer
