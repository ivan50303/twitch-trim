import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'
import * as readline from 'node:readline/promises'

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')
const TOKEN_PATH = path.join(process.cwd(), 'token.json')
const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

async function getOAuth2Client() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH))
    const { client_secret, client_id, redirect_uris } = credentials.web
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )

    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH))
      oAuth2Client.setCredentials(token)
      return oAuth2Client
    } catch (err) {
      return getNewToken(oAuth2Client)
    }
  } catch (err) {
    console.error('Error loading client secret file:', err)
    throw err
  }
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: YOUTUBE_SCOPES,
  })

  console.log('Authorize this app by visiting this url:', authUrl)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const code = await rl.question('Enter the code from that page here: ')

  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
  console.log('Access token and refresh token stored to', TOKEN_PATH)

  return oAuth2Client
}

export default getOAuth2Client
