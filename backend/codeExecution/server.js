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
const Queue = require('bull')
const codeQueue = new Queue('code-queue')
const WebSocket = require('ws')


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
const upload = multer({ storage: storage })

// Parse incoming JSON data
router.use(express.json())

// Set the working directory within the Node.js server
process.chdir(__dirname)

// Handle POST request to '/execute' endpoint
router.post('/execute', upload.single('file'), async (req, res) => {
  const username = req.body.username
  const userDirectory = `submissions/${username}`
  const outputDirectory = `output/${username}`

  // Create user-specific directories
  fs.mkdirSync(userDirectory, { recursive: true })
  fs.mkdirSync(outputDirectory, { recursive: true })

  if (req.file) {
    const sourceCodeFile = `/submissions/${req.body.username}/${req.file.originalname}`
    const command = ['/entrypoint.sh', req.body.username, sourceCodeFile]

    // Add a job to the queue
    codeQueue
      .add({
        username: username,
        command: command,
        userDirectory: userDirectory,
        outputDirectory: outputDirectory,
      })
      .then(() => console.log('Job added to the queue'))

    // Send a response to the client
    res.send({
      status: 'Your code has been submitted and will be executed shortly.',
    })
  }
})

// Process the jobs
codeQueue.process(async (job) => {
  console.log('Processing job:', job.id)

  const { username, command, userDirectory, outputDirectory } = job.data

  // Create a Docker container
  const container = await docker
    .createContainer({
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
    .catch((err) => console.error('Error creating the container:', err))

  console.log('Container created:', container.id)

  // Start the container
  await container
    .start()
    .catch((err) => console.error('Error starting the container:', err))

  // Stop and remove the container after execution
  const containerData = await container.inspect()
  if (containerData.State.Running) {
    await container.stop()
  }
  await container.remove()

  // Read output file and send data as response
  try {
    const compilerOutput = await fs.promises.readFile(
      `${__dirname}/${outputDirectory}/compiler_output.txt`,
      'utf8',
    )
    const programOutput = await fs.promises.readFile(
      `${__dirname}/${outputDirectory}/program_output.txt`,
      'utf8',
    )
    const programErrors = await fs.promises.readFile(
      `${__dirname}/${outputDirectory}/program_errors.txt`,
      'utf8',
    )
    const compileStatus = await fs.promises.readFile(
      `${__dirname}/${outputDirectory}/status.txt`,
      'utf8',
    )

    res.send({ compilerOutput, programOutput, programErrors, compileStatus })
  } catch (err) {
    console.error('Error reading the file:', err)
  }
})

// Handle GET request to fetch compile status
router.get('/compile-status', (req, res) => {
  const username = req.query.username
  const outputDirectory = `output/${username}`

  try {
    const compileStatus = fs.readFileSync(
      path.join(__dirname, outputDirectory, 'status.txt'),
      'utf8',
    )
    res.send({ compileStatus })
  } catch (err) {
    console.error('Error reading the file:', err)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
