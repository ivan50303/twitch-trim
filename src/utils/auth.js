import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];


async function getOAuth2Client(code = null) {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
      oAuth2Client.setCredentials(token);
      console.log('token exists already')
      return oAuth2Client;
    } catch (err) {
      if(code) {
        console.log('getting new token...')
        return getNewToken(oAuth2Client, code);
      } else {
        console.log('asdoija')
        return oAuth2Client
      }
    }
  } catch (err) {
    console.error('Error loading client secret file:', err);
    throw err;
  }
}

async function getNewToken(oAuth2Client, authorizationCode) {

  console.log("Oauth2client given is : " + oAuth2Client)
  console.log('code given is ' + authorizationCode)
  
  const { tokens } = await oAuth2Client.getToken(authorizationCode)
  
  oAuth2Client.setCredentials(tokens)

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
  console.log('Access token and refresh token stored to', TOKEN_PATH)

  return oAuth2Client
}

export default getOAuth2Client

// async function getOAuth2Client() {
//     const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
//     const { client_secret, client_id, redirect_uris } = credentials.web;
//     const oAuth2Client = new google.auth.OAuth2(
//       client_id,
//       client_secret,
//       redirect_uris[0]
//     );

//     try {
//       console.log('Token Path: ' + TOKEN_PATH)
//       const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
//       oAuth2Client.setCredentials(token);
//       return oAuth2Client;
//     } catch (err) {
//       console.error('Error loading token: ' + err)
//     }
// }

// async function getNewToken(oAuth2Client, authorizationCode) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: YOUTUBE_SCOPES,
//     client_id: oAuth2Client._clientId,
//     redirect_uri: oAuth2Client._redirectUri,
//   });

//   console.log('code sent is ' + authorizationCode)
  
//   try {
//     const { tokens } = await oAuth2Client.getToken(authorizationCode)
//   oAuth2Client.setCredentials(tokens)

//   fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
//   console.log('Access token and refresh token stored to', TOKEN_PATH)

//   return tokens.access_token
//   } catch (err) {
//     console.error('Error retreiving access token in getNewToken')
//     throw err
//   }
// }