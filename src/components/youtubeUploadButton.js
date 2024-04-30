import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const YouTubeUploadButton = ({ videoPath }) => {
  console.log('button rendered')
  const [authorizationUrl, setAuthorizationUrl] = useState(null);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const videoPathRef = useRef(videoPath)
  videoPathRef.current = videoPath
  console.log('video path ref' + videoPathRef.current)

  console.log("hasAccessToken is: " + hasAccessToken)
        console.log('returned auth url is : ' + authorizationUrl)

  useEffect(() => {
    const fetchAuthorizationUrl = async () => {
      try {
        console.log('fetching auth url')
        const response = await axios.get('/api/checkAccessToken');
        console.log(response)
        setHasAccessToken(response.data.hasAccessToken)
        setAuthorizationUrl(response.data.authorizationUrl)
        // console.log("hasAccessToken is: " + hasAccessToken)
        // console.log('returned auth url is : ' + authorizationUrl)
        console.log('')
      } catch (error) {
        console.error('Error fetching authorization URL:', error);
      }
    };

    fetchAuthorizationUrl();
  }, []);

  useEffect(() => {
    console.log('useeffect run')
    const fetchAccessToken = async (authorizationCode) => {
      try {
        console.log('storing access token')
        await axios.post('/api/storeAccessToken', { code: authorizationCode });
      } catch (error) {
        console.error('Error storing access token:', error);
      }
    };

    const handleUpload = async () => {
      try {
        console.log('attempting video upload in handleupload')
        console.log('video pathq is: ' + videoPathRef.current)
        const categoryName = 'category_name'; // Replace with the actual category name
        const videoFilePath = videoPathRef.current
        const uploadResponse = await axios.post('/api/youtubeUploader', {
          videoFilePath,
          categoryName,
        });

      if (uploadResponse.status === 200) {
        console.log('Video uploaded successfully!');
      } else {
        console.error('Error uploading video');
      }
      } catch (error) {
        console.error('Error uploading video:', error);
      }
      
    }

    const searchParams = new URLSearchParams(window.location.search);
    const authorizationCode = searchParams.get('code');
    console.log(authorizationCode)

    if (authorizationCode) {
      fetchAccessToken(authorizationCode);
      console.log('handling upload')
      handleUpload()
    }
  }, []);


  const handleUploadButtonClick = async () => {
    console.log('button clicked')
    console.log('hasAccessToken is now: ' + hasAccessToken)
    // console.log('aut url:' + authorizationUrl)
      try {
        if (!hasAccessToken && authorizationUrl) {
          window.location.href = authorizationUrl
        } 

        console.log('attempting video upload')
        const categoryName = 'category_name'; // Replace with the actual category name
        const uploadResponse = await axios.post('/api/youtubeUploader', {
          videoPath,
          categoryName,
        });
  
        if (uploadResponse.status === 200) {
          console.log('Video uploaded successfully!');
        } else {
          console.error('Error uploading video');
        }
    } catch (error) {
        console.error('Error uploading video:', error);
    }
    
};

  return (
    <button onClick={handleUploadButtonClick}>Upload to YouTube</button>
  );
};

export default YouTubeUploadButton;