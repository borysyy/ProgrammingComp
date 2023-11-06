const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const Docker = require('dockerode');
const docker = new Docker();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create a directory for each user inside the 'submissions' folder
        const userDirectory = `submissions/${req.body.username}`;
        fs.mkdirSync(userDirectory, { recursive: true }); // Create the directory if it doesn't exist
        cb(null, userDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original filename
    },
});

const upload = multer({ storage: storage });

app.use(express.json());

// Set the working directory within the Node.js server, not the Docker container
process.chdir(__dirname);

app.post('/execute', upload.single('file'), async (req, res) => {
    const { code } = req.body;

    if (req.file) {
        const userDirectory = `/submissions/${req.body.username}`;
        const uploadedFilePath = path.join(userDirectory, req.file.originalname);
        const codeFileName = path.basename(uploadedFilePath, path.extname(uploadedFilePath));

        // Create a Docker container from an image with the necessary compilation tools
        const container = await docker.createContainer({
            Image: 'my-cpp-app', // Use the image name for your C++ environment
            Tty: true, // Allocate a pseudo-TTY
            Detach: true, // Run the container in detached mode
            HostConfig: {
                Binds: [`${__dirname}/submissions:/submissions`], // Mount the submissions directory
            },
        });

        // Start the container
        await container.start();

        // Define the command to compile and run the C++ code within the container
        const sourceCodeFile = `/submissions/${req.body.username}/${req.file.originalname}`;
        const command = `/entrypoint.sh "${sourceCodeFile}"`; // Pass the source code file as an argument

        // Execute the command within the container
        const exec = await container.exec({
            Cmd: ['bash', '-c', command],
            AttachStdout: true,
            AttachStderr: true,
        });

        const outputStream = await exec.start();

        let output = '';

        // Capture the output
        await new Promise((resolve) => {
            outputStream.on('data', (data) => {
                output += data.toString();
            });

            outputStream.on('end', resolve);
        });

        await container.stop();

        // Remove the container
        // await container.remove();

        res.json({ result: 'Success', output });
    } else {
        res.json({ result: 'Error', error: 'No file uploaded.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




