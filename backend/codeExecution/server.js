// server.js
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const http = require('http')
const app = express()
const bcrypt = require('bcryptjs')
const SPCP = require('../database/database.js')
const cors = require('cors')
const Queue = require('bull')
const codeQueue = new Queue('code-queue')
const WebSocket = require('ws')

const router = express.Router()
const Docker = require('dockerode')
const docker = new Docker()

router.use(cors())

app.use(
  express.json({
    type: ['application/json', 'text/plain'],
  }),
)

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
    codeQueue.add({
      username: username,
      command: command,
      userDirectory: userDirectory,
      outputDirectory: outputDirectory,
    })
    codeQueue.on('completed', (result) =>
      res.send({ username, ...result.returnvalue }),
    )
  }
})

// Process the jobs
codeQueue.process(async (job, done) => {
  console.log('Processing job:', job.id)

  const { username, command, outputDirectory } = job.data

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
    const compilerOutput = fs.readFileSync(
      `${__dirname}/${outputDirectory}/${username}_compiler_output.txt`,
      'utf-8',
    )

    const programOutput = fs.readFileSync(
      `${__dirname}/${outputDirectory}/${username}_program_output.txt`,
      'utf-8',
    )
    done(null, { compilerOutput, programOutput })
  } catch (err) {
    console.error('Error reading the file:', err)
  }
})

//will be used to put a new user in the database
router.post('/CreateAccount/register', async (req, res) => {
  console.log(JSON.stringify(req.body))
  const hashedPassword = await bcrypt.hash(req.body.password, 10)
  const successfulUpdate = SPCP.updateUsersTable(
    req.body.username,
    hashedPassword,
    req.body.email,
  )

  res.sendStatus(successfulUpdate)
})

//will be used to authorize a login
router.post('/Login/auth', async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = await SPCP.checkLogin(email)
  const isValid = await bcrypt.compare(password, hashedPassword)

  if (isValid) {
    res.sendStatus(200)
    console.log('Password matches')
  } else {
    res.sendStatus(401)
    console.log('Wrong password')
  }
})

//put team in the database
router.post('/RegisterTeam/register', async (req, res) => {
  console.log(JSON.stringify(req.body))
  const teamName = req.body.teamName
  const allEmails = req.body.teamMember
  const cntEmails = Object.keys(allEmails).length
  const dbStatus = SPCP.updateTeamTable(teamName, allEmails, cntEmails)
  res.send(dbStatus)
})

module.exports = router
