import { useEffect, useState } from 'react';
import axios from 'axios';

const YouTubeUploadButton = ({ videoPath }) => {
  console.log('button rendered')
  const [authorizationUrl, setAuthorizationUrl] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchAuthorizationUrl = async () => {
      try {
        console.log('fetching auth url')
        const response = await axios.get('/api/getAuthorizationUrl');
        setAuthorizationUrl(response.data.authorizationUrl);
      } catch (error) {
        console.error('Error fetching authorization URL:', error);
      }
    };

    fetchAuthorizationUrl();
  }, []);

  useEffect(() => {
    console.log('url changed')
    const fetchAccessToken = async (authorizationCode) => {
      try {
        console.log('fetching access token')
        const response = await axios.post('/api/getAccessToken', { code: authorizationCode });
        setAccessToken(response.data.access_token);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    const searchParams = new URLSearchParams(window.location.search);
    const authorizationCode = searchParams.get('code');
    console.log(authorizationCode)
    if (authorizationCode) {
      fetchAccessToken(authorizationCode);
    }
  }, []);

  const handleUploadButtonClick = async () => {
    console.log('button clicked')
    if (!accessToken) {
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        console.error('Authorization URL not available');
      }
      return;
    }

    try {
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