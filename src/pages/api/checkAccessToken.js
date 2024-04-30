import fs from 'fs'
import path from 'path';
import getOAuth2Client from '@/utils/auth';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

export default async function handler(req, res) {
    const hasAccessToken = checkIfUserHasAccessToken()

    if (hasAccessToken) {
        res.status(200).json({hasAccessToken: true})
    } else {
        const authorizationUrl = await getAuthorizationUrl()
        res.status(200).json({hasAccessToken: false, authorizationUrl: authorizationUrl})
    }
}

function checkIfUserHasAccessToken() {
    try{
        fs.accessSync(TOKEN_PATH, fs.constants.F_OK)
        return true
    } catch (error) {
        if(error.code === "ENOENT") {
            return false
        } else {
            console.error("Error checking access token file:", error)
            return false
        }
    }
}

async function getAuthorizationUrl() {
    try {
        const oAuth2Client = await getOAuth2Client()
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: YOUTUBE_SCOPES,
          });

          return authUrl
          
    } catch (error) {
        console.error("Error generating authorization URL:", error)
        res.status(500).json({error: "Failed to generate authorization URL"})
    }
}