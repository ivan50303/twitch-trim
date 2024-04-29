import { google } from 'googleapis';

const CLIENT_ID = '26257329934-gc5bnl2gefcc0ho11iktbd5h5g2hj16l.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:8080';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

async function testGenerateAuthUrl() {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: YOUTUBE_SCOPES,
    });

    console.log('Authorization URL from testauth.js:', authUrl);
  } catch (error) {
    console.error('Error generating authorization URL:', error);
  }
}

testGenerateAuthUrl();