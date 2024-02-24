// server.js
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const Docker = require('dockerode')
const docker = new Docker()
const cors = require('cors')

// Serve static files from 'public' and 'output' directories
router.use(express.static('output'))

router.use(cors())

// Parse URL-encoded form data
router.use(bodyParser.urlencoded({ extended: true }))

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDirectory = `submissions/${req.body.username}`
    fs.mkdirSync(userDirectory, { recursive: true })
    cb(null, userDirectory)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

// Set up multer middleware for file uploads
const upload = multer({ storage: storage }).array('files', 10); // 'files' is the name attribute in your HTML file

// Parse incoming JSON data
router.use(express.json())

// Set the working directory within the Node.js server
process.chdir(__dirname)

// Handle POST request to '/execute' endpoint
router.post('/execute', upload, async (req, res) => {
  await fs.promises.writeFile(
    `${__dirname}/output/compiler_output.txt`,
    '',
    'utf8',
  )
  await fs.promises.writeFile(
    `${__dirname}/output/program_output.txt`,
    '',
    'utf8',
  )
  await fs.promises.writeFile(
    `${__dirname}/output/program_errors.txt`,
    '',
    'utf8',
  )

  const { code } = req.body

  if (req.files && req.files.length > 0) {
    const sourceCodeFiles = req.files.map((file) => `/submissions/${req.body.username}/${file.originalname}`);
    const command = ['/entrypoint.sh', ...sourceCodeFiles]

    // Create a Docker container
    const container = await docker.createContainer({
      Image: 'code-execute',
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
      Detach: true,
      HostConfig: {
        Binds: [
          `${__dirname}/submissions:/submissions`,
          `${__dirname}/output:/output`,
        ],
      },
    })

    // Start the container
    await container.start()

    // Stop and remove the container after execution
    const containerData = await container.inspect()
    if (containerData.State.Running) {
      await container.stop()
    }
    await container.remove()

    // Read output file and send data as response
    try {
      const compilerOutput = await fs.promises.readFile(
        `${__dirname}/output/compiler_output.txt`,
        'utf8',
      )
      const programOutput = await fs.promises.readFile(
        `${__dirname}/output/program_output.txt`,
        'utf8',
      )
      const programErrors = await fs.promises.readFile(
        `${__dirname}/output/program_errors.txt`,
        'utf8',
      )

      res.send({ compilerOutput, programOutput, programErrors })
    } catch (err) {
      console.error('Error reading the file:', err)
    }
  }
})

module.exports = router


