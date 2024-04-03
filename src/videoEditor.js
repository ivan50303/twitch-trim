import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import axios from 'axios'

async function createVideoFromClips(clips) {
  const { data } = clips

  const tempDir = path.join(process.cwd(), 'temp')
  fs.mkdirSync(tempDir, { recursive: true })

  const clipPaths = await downloadAndSaveClips(data, tempDir)

  const inputFileList = clipPaths
    .map((clipPath) => {
      return `file '${clipPath}'`
    })
    .join('\n')

  const inputFileListPath = path.join(tempDir, 'input_file_list.txt')
  fs.writeFileSync(inputFileListPath, inputFileList)

  const outputVideoPath = path.join(tempDir, 'output_video.mp4')

  const ffmpegPath = process.env.FFMPEG_EXE_PATH
  const ffmpegCommand = `${ffmpegPath} -f concat -safe 0 -i ${inputFileListPath} -c copy ${outputVideoPath}`

  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegCommand, { shell: true })

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve(outputVideoPath)
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`))
      }
    })
  })
}

async function downloadAndSaveClips(data, tempDir) {
  const clipPaths = []

  for (const clip of data) {
    const clipUrl = clip.thumbnail_url.replace('-preview-480x272.jpg', '.mp4')
    const clipFileName = `${clip.id}.mp4`
    const clipFilePath = path.join(tempDir, clipFileName)

    try {
      const response = await axios({
        method: 'get',
        url: clipUrl,
        responseType: 'stream',
      })

      const outputStream = fs.createWriteStream(clipFilePath)
      response.data.pipe(outputStream)

      await new Promise((resolve, reject) => {
        outputStream.on('finish', () => {
          clipPaths.push(clipFilePath)
          resolve()
        })
        outputStream.on('error', reject)
      })
    } catch (error) {
      console.log(error)
      console.error(Error`downloading clip ${clip.id}: ${error.message}`)
      throw error
    }
  }

  return clipPaths
}

export default createVideoFromClips
