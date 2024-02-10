const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const Docker = require('dockerode');
const docker = new Docker();
const port = 3001;
const cors = require('cors');
const http = require('http');
const bcrypt = require('bcryptjs');
const SPCP = require('../database/database.js');

// Serve static files from 'public' and 'output' directories
app.use(express.static('output'));

app.use(cors());

app.use(express.json({
    type: ['application/json', 'text/plain']
  }))

// Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDirectory = `submissions/${req.body.username}`;
        fs.mkdirSync(userDirectory, { recursive: true });
        cb(null, userDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

// Set up multer middleware for file uploads
const upload = multer({ storage: storage });

// Parse incoming JSON data
app.use(express.json());

// Set the working directory within the Node.js server
process.chdir(__dirname);

// Handle POST request to '/execute' endpoint
app.post('/execute', upload.single('file'), async (req, res) => {
    const { code } = req.body;

    if (req.file) {
        const sourceCodeFile = `/submissions/${req.body.username}/${req.file.originalname}`;
        const command = ['/entrypoint.sh', sourceCodeFile];
               
        // Flush output.txt before creating the container
        fs.writeFileSync(`${__dirname}/output/output.txt`, '', 'utf8');

        // Create a Docker container
        const container = await docker.createContainer({
            Image: 'my-cpp-app',
            Cmd: command,
            AttachStdoout: true,
            AttachStderr: true,
            Detach: true,
            HostConfig: {
                Binds: [
                    `${__dirname}/submissions:/submissions`,
                    `${__dirname}/output:/output`,
                ],
            },
        });

        // Start the container
        await container.start();

        // Attach to container output (stdout and stderr)
        const logs = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
        });

        // Read output from logs and write to output.txt
        logs.on('data', (data) => {
            fs.appendFileSync(`${__dirname}/output/output.txt`, data.toString(), 'utf8')
        })

        // Stop and remove the container after execution
        await container.stop();
        await container.remove();

        // Read output file and send data as response
        fs.readFile(`${__dirname}/output/output.txt`, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }
            
            // If there are errors, then filter but if not then don't
            const hasErrors = data.toLowerCase().includes('error');
            const filteredData = hasErrors ? filterOutputFile(data, req.body.username) : data

            res.send({ output: filteredData })
        });
    }
});

function filterOutputFile(logString, username){
    const lines = logString.split('\n')
    let filteredOutput = ''

    for (const line of lines) {
        // Removes the first 8 characters of each line. This may seem hard coded,
        // but every uncompilable code I've submitted has shown that the first 8 characters of
        // output.txt is nonsense characters.
        const cleanLine = line.slice(8)

        // Remove file paths and keep file names
        cleanLine.replace(new RegExp(`\\/submissions\\/${username}\\/`), '').trim()

        if (!cleanLine) {
            continue; // Skip empty lines
        }

        // Remove unwanted characters at the beginning of each line
        const filteredLine = cleanLine.replace(/^\s*\S+:\s*/, '')

        // Remove non-printable ASCII characters
        const printableLine = filteredLine.replace(/[^ -~]/g, '')

        filteredOutput += `${printableLine}\n`
    }

    return filteredOutput
}

//will be used to put a new user in the database
app.post("/CreateAccount/register", async (req, res) => {
	const account = req.body;
    const username = account.username;
    const password = account.password;
    const hashedPassword = await bcrypt.hash(password, 13);
    const email = account.email;
    let userExist = SPCP.updateUsersTable(username, hashedPassword, email);
    //if the user successfully is added to the database, redirect the user home with a 200 status
    return res.sendStatus(userExist);
});

//will be used to authorize a login
app.post("/Login/auth", async (req, res) =>{
    const loginInfo = req.body;
    const email = loginInfo.email;
    const password = loginInfo.password;
    const hashedPassword = SPCP.checkLogin(email);
    sql = "SELECT password FROM users WHERE email = '" + email + "';"
    console.log("HASHED: " + JSON.stringify(hashedPassword));
    const isValid = bcrypt.compare(password, hashedPassword);
    console.log("PASSWORD:" + password);
    console.log("EMAIL:" + email);
    console.log("ISVALID: " + isValid);

    if (isValid){
        res.status(200);
        console.log("Password matches");
    }
    else {
        res.status(401);
        console.log("Wrong password");
    }
});

// Start the Express.js server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
