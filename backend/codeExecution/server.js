const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const http = require('http');
const bcrypt = require('bcryptjs');
const SPCP = require('../database/database.js');

// server.js
const router = express.Router()
const Docker = require('dockerode')
const docker = new Docker()

// Serve static files from 'public' and 'output' directories
router.use(express.static('output'))

router.use(cors())

app.use(express.json({
    type: ['application/json', 'text/plain']
  }))

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
router.use(bodyParser.json())

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
      res.send({ compilerOutput, programOutput, programErrors })
    } catch (err) {
      console.error('Error reading the file:', err)
    }
  }
})


//will be used to put a new user in the database
router.post("/CreateAccount/register", async (req, res) => {
  console.log(JSON.stringify(req.body));
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const successfulUpdate = SPCP.updateUsersTable(req.body.username, hashedPassword, req.body.email); 
  
  res.send(successfulUpdate)
});

//will be used to authorize a login
router.post("/Login/auth", async (req, res) =>{
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await SPCP.checkLogin(email);
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (isValid){
        res.sendStatus(200);
        console.log("Password matches");
    }
    else {
        res.sendStatus(401);
        console.log("Wrong password");
    }
});

//put team in the database
router.post("/RegisterTeam/register", async (req, res) => {
	console.log(JSON.stringify(req.body));
	const teamName = req.body.teamName;
	const allEmails = req.body.teamMember;
	const cntEmails = Object.keys(allEmails).length;
	const dbStatus = SPCP.updateTeamTable(teamName, allEmails, cntEmails);
	res.send (dbStatus);
});

module.exports = router
