import { google } from 'googleapis';
import getOAuth2Client from '../../utils/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code } = req.body;
    console.log('api/storeAccessToken called')

    try {
      await getOAuth2Client(code);
      res.status(200).json({message: 'Access token obtained and stored successfully'})
      console.log('token stored')
    } catch (error) {
      console.error('Error obtaining access token:', error);
      res.status(500).json({ error: 'Failed to obtain access token'});
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}