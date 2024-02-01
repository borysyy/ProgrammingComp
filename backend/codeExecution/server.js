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


// Serve static files from 'public' and 'output' directories
app.use(express.static('output'));

app.use(cors());

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

// Start the Express.js server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
