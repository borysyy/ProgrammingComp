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
app.use(express.static('public'));
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
        
        // Create a Docker container
        const container = await docker.createContainer({
            Image: 'my-cpp-app',
            Cmd: command,
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

        // Stop and remove the container after execution
        await container.stop();
        await container.remove();

        // Read output file and send data as response
        fs.readFile(`${__dirname}/output/output.txt`, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }
            res.send({ output: data });
        });
    }
});

// Start the Express.js server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




