import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import axios from 'axios'

export default async function handler(req, res) {
  try {
    const clips = req.body
    const { data } = clips

    console.log('Creating video...')

    const outputVideoPath = await createVideoFromClips(data)

    res.setHeader('Content-Type', 'video/mp4')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${path.basename(outputVideoPath)}"`
    )
    res.setHeader('X-Video-Path', outputVideoPath)

    const videoStream = fs.createReadStream(outputVideoPath)

    videoStream.pipe(res)
  } catch (error) {
    console.error('Error creating video:', error)
    res.status(500).json({ error: 'Failed to create video' })
  }
}

async function createVideoFromClips(clips) {
  const { data } = clips
  const tempDir = path.join(process.cwd(), 'temp')
  fs.mkdirSync(tempDir, { recursive: true })

  fs.readdirSync(tempDir).forEach((file) => {
    const filePath = path.join(tempDir, file)
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true })
    } else {
      fs.unlinkSync(filePath)
    }
  })

  const inputFileListPath = path.join(tempDir, 'input_file_list.txt')
  fs.closeSync(fs.openSync(inputFileListPath, 'w'))

  const clipPaths = await downloadAndSaveClips(data, tempDir)
  const preprocessedClipPaths = await preprocessClips(clipPaths, tempDir)
  const inputFileListStats = fs.statSync(inputFileListPath)
  const hasInputContent = inputFileListStats.size > 0

  let inputFileList
  if (hasInputContent) {
    fs.truncateSync(inputFileListPath)
  } else {
    inputFileList = preprocessedClipPaths
      .map((clipPath) => {
        return `file '${clipPath}'`
      })
      .join('\n')
    fs.writeFileSync(inputFileListPath, inputFileList)
  }

  const outputVideoPath = path.join(tempDir, 'output_video.mp4')
  if (fs.existsSync(outputVideoPath)) {
    fs.unlinkSync(outputVideoPath)
  }

  const ffmpegPath = process.env.FFMPEG_EXE_PATH
  // const ffmpegCommand = `${ffmpegPath} -v verbose -f concat -safe 0 -i ${inputFileListPath} -vf "scale=1920:1080:force_original_aspect_ratio=decrease,fps=30" ${outputVideoPath}`
  const ffmpegCommand = `${ffmpegPath} -f concat -safe 0 -i ${inputFileListPath} -c copy ${outputVideoPath}`
  // const ffmpegCommand = `${ffmpegPath} -f concat -safe 0 -i ${inputFileListPath} -c:v libx264 -r 30 -c:a aac ${outputVideoPath}`;

  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegCommand, { shell: true })

    let stdoutData = ''
    let stderrData = ''

    ffmpegProcess.stdout.on('data', (data) => {
      stdoutData += data.toString()
    })

    ffmpegProcess.stderr.on('data', (data) => {
      stderrData += data.toString()
    })

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log('FFmpeg stdout:', stdoutData)
        resolve(outputVideoPath)
      } else {
        const error = new Error(
          `FFmpeg process exited with code ${code}\n${stderrData}`
        )
        console.error(error)
        reject(error)
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

async function preprocessClips(clipPaths, tempDir) {
  const preprocessedClipPaths = []

  for (const clipPath of clipPaths) {
    const preprocessedClipPath = path.join(tempDir, `preprocessed_${path.basename(clipPath)}`)

    const ffmpegPath = process.env.FFMPEG_EXE_PATH
    const ffmpegCommand = `${ffmpegPath} -i ${clipPath} -c:v libx264 -preset ultrafast -pix_fmt yuv420p -vf scale=1280:720,setsar=1,fps=30 -c:a aac -ar 44100 -ac 2 ${preprocessedClipPath}`

    await new Promise((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegCommand, { shell: true })

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          preprocessedClipPaths.push(preprocessedClipPath)
          resolve()
        } else {
          reject(new Error(`FFmpeg preprocessing failed for clip ${clipPath}`))
        }
      })
    })
  }

  return preprocessedClipPaths
}
