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

    res.status(200).json({ videoPath: outputVideoPath })
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
  const inputFileListStats = fs.statSync(inputFileListPath)
  const hasInputContent = inputFileListStats.size > 0

  let inputFileList
  if (hasInputContent) {
    fs.truncateSync(inputFileListPath)
  } else {
    inputFileList = clipPaths
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
  const ffmpegCommand = `${ffmpegPath} -f concat -safe 0 -i ${inputFileListPath} -c copy ${outputVideoPath}`
  
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegCommand, { shell: true })
    
    let stdoutData = '';
    let stderrData = '';

    ffmpegProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    ffmpegProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log('FFmpeg stdout:', stdoutData);
        resolve(outputVideoPath);
      } else {
        const error = new Error(`FFmpeg process exited with code ${code}\n${stderrData}`);
        console.error(error);
        reject(error);
      }
    });
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
