import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');


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
      return oAuth2Client;
    } catch (err) {
      if(code) {
        return getNewToken(oAuth2Client, code);
      } else {
        return oAuth2Client
      }
    }
  } catch (err) {
    console.error('Error loading client secret file:', err);
    throw err;
  }
}

async function getNewToken(oAuth2Client, authorizationCode) {  
  const { tokens } = await oAuth2Client.getToken(authorizationCode)
  oAuth2Client.setCredentials(tokens)
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))

  return oAuth2Client
}

export default getOAuth2Client