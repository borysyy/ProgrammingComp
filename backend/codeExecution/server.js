const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const app = express()
const Docker = require('dockerode')
const docker = new Docker()
const port = 3001
const cors = require('cors')


// Serve static files from 'public' and 'output' directories
app.use(express.static('output'))

app.use(cors());

// Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }))

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
});

// Set up multer middleware for file uploads
const upload = multer({ storage: storage })

// Parse incoming JSON data
app.use(express.json())

// Set the working directory within the Node.js server
process.chdir(__dirname)

// Handle POST request to '/execute' endpoint
app.post('/execute', upload.single('file'), async (req, res) => {
    const { code } = req.body

    if (req.file) {
        const sourceCodeFile = `/submissions/${req.body.username}/${req.file.originalname}`
        const command = ['/entrypoint.sh', sourceCodeFile]
               
        // Flush output.txt before creating the container
        fs.writeFileSync(`${__dirname}/output/output.txt`, '', 'utf8')

        // Create a Docker container
        const container = await docker.createContainer({
            Image: 'my-cpp-app',
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
        });

        // Start the container
        await container.start();

        // Attach to container output (stdout and stderr)
        const logs = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
        });

        // Stop and remove the container after execution
        await container.stop()
        await container.remove()

        // Read output from logs and write to output.txt
        logs.on('data', (data) => {
            fs.appendFileSync(`${__dirname}/output/output.txt`, data.toString(), 'utf8')
        })

        // Read output file and send data as response
        fs.readFile(`${__dirname}/output/output.txt`, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err)
                return
            }
            
            // If there are errors, then filter but if not then don't
            const errorRegex = /error|failed|exception/i
            const hasErrors = errorRegex.test(data)
            const filteredData = hasErrors ? filterOutputFile(data, req.body.username) : data

            res.send({ output: filteredData })
        });
    }
});

function filterOutputFile(logString, username){
    const adjustedOutput = removeRepeatedErrors(logString)
    const lines = adjustedOutput.split('\n')
    let filteredOutput = ''

    for (const line of lines) {
        // Removes the first 8 characters of each line. This may seem hard coded,
        // but every uncompilable code I've submitted has shown that the first 8 characters of
        // output.txt are nonsense characters.
        const cleanLine = line.slice(8)

        // // Remove unwanted characters at the beginning of each line
        const filteredLine = cleanLine.replace(/^\s*[^:]+:\s*/, ' ')

        // Remove non-printable ASCII characters
        const printableLine = filteredLine.replace(/[^ -~]/g, ' ')

        filteredOutput += `${printableLine}\n`
    }

    return filteredOutput
}

// To deal with the errors being repeated twice.
// Basically a brute-force solution but it works for now.
function removeRepeatedErrors(logString){
    // Split the content into lines
    const lines = logString.split('\n')

    // Determine the index to keep only the first half of lines
    const halfIndex = Math.floor(lines.length / 2)

    // Keep only the first half of lines
    const firstHalf = lines.slice(0, halfIndex).join('\n')

    // Return the firstHalf
    return firstHalf
}

// Start the Express.js server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});
