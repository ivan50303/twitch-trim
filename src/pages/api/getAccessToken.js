import { google } from 'googleapis';
import getOAuth2Client from '../../utils/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code } = req.body;

    try {
      console.log('api/getAccessToken called')
      const oAuth2Client = await getOAuth2Client(code);
      console.log('Oauth2client is: ' + oAuth2Client)
      console.log('code is ' + code)
      // await getNewToken(oAuth2Client, code)
      // console.log(oAuth2Client)
      res.status(200).json({message: 'Access token obtained and stored successfully'})
      // const { tokens } = await oAuth2Client.getToken(code);
      // oAuth2Client.setCredentials(tokens);
      // console.log('token:' + tokens.access_token)
      // res.status(200).json({ access_token: tokens.access_token });
    } catch (error) {
      console.error('Error obtaining access token:', error);
      res.status(500).json({ error: 'Failed to obtain access token' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}