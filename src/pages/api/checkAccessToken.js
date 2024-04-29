import fs from 'fs'
import path from 'path';
import getOAuth2Client from '@/utils/auth';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

export default async function handler(req, res) {
    const hasAccessToken = checkIfUserHasAccessToken()
    console.log('hasAccessTokens is :' + hasAccessToken)

    if (hasAccessToken) {
        res.status(200).json({hasAccessToken: true})
    } else {
        console.log('else ran')
        const authorizationUrl = await getAuthorizationUrl()
        // console.log('the aut url: ' + authorizationUrl)
        console.log('Returning hasAccessToken: ' + hasAccessToken +'and authorizationUrl: '+  authorizationUrl)
        res.status(200).json({hasAccessToken: false, authorizationUrl: authorizationUrl})
        // console.log(res.status(200).json({hasAccessToken: false, authorizationUrl}))
    }
}

function checkIfUserHasAccessToken() {
    try{
        fs.accessSync(TOKEN_PATH, fs.constants.F_OK)
        console.log(TOKEN_PATH)
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
        console.log('genereatnig authurl...')
        const oAuth2Client = await getOAuth2Client()
        // console.log('oauth2client :' + oAuth2Client)
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: YOUTUBE_SCOPES,
          });
        //   console.log('the authurl si: '+ authUrl)
          return authUrl
        // res.status(200).json({authorizationUrl: authUrl})
    } catch (error) {
        console.error("Error generating authorization URL:", error)
        res.status(500).json({error: "Failed to generate authorization URL"})
    }
}