import getOAuth2Client from '../../utils/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code } = req.body;

    try {
      await getOAuth2Client(code);
      res.status(200).json({message: 'Access token obtained and stored successfully'})
    } catch (error) {
      console.error('Error obtaining access token:', error);
      res.status(500).json({ error: 'Failed to obtain access token'});
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}