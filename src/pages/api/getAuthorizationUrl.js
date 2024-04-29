import getOAuth2Client  from "../../utils/auth";
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    console.log('call made to getauthurl')
    const oAuth2Client = await getOAuth2Client();
    console.log('Oauth2client: ' + oAuth2Client)
    const authUrl = oAuth2Client.authUrl
    console.log('The AuthURL is asd: ' + authUrl)
    
    res.status(200).json({ authorizationUrl: authUrl });
  } catch (error) {
    console.error('Error generating authorization URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
}