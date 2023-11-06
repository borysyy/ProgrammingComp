// Imports the Express.js framework, web application framework for building web servers.
const express = require('express');
// Handling multipart/form-data, used for file uploads. Allows you to handle file uploads easily in an Express App.
const multer = require('multer');
// Parsing the body of HTTP requests, typically used to parse JSON and URL-encoded request bodies.
const bodyParser = require('body-parser');
// Node.js built-in "File System" module, used for reading and writing files on the server's file system.
const fs = require('fs');
// Built in Node.js module for working with file and directory paths
const path = require('path');
// Creates an instance of the Express application, which will be used to define, routes,
// middleware, and handle HTTP requests and responses.
const app = express();
// Defines the port on which the Express app will listen for incoming HTTP requests.
const port = 3000;
// Import the Docker client library called dockerode, allows you to interact with Docker containers
// and the Docker daemon with JS.
const Docker = require('dockerode');
// Initializes a new Docker client. Creates a new instance of the Docker client,
// which will be used to communicate with the Docker daemon running on the server. 
const docker = new Docker();

// Configures Express.js to serve static files from a directory named 'public.' 
// When a client makes an HTTP request for a file, Express will look for the file in the 
// 'public' directory and serve it if it exists. This is commonly used for serving static assets
// like HTML, CSS, JS, etc.
app.use(express.static('public'));

// Configures the body-parser middleware to handle URL-encoded form data. 
// It allows your application to parse and access data sent from HTML forms with
// the "application/x-www-form-urlencoded" content type. 
app.use(bodyParser.urlencoded({ extended: true }));

// Defines a storage engine for multer. Specifies where to store uploaded files
// and how to name them. The diskStorage engine is used, which saves file to the server's local disk.
const storage = multer.diskStorage({
    // Function specifies the destination directory where uploaded files should be stored.
    // Dynamically creates a directory for each user inside the submissions folder. If the 
    // user directory doesn't exist, it is created.
    destination: (req, file, cb) => {
        // Create a directory for each user inside the 'submissions' folder
        const userDirectory = `submissions/${req.body.username}`;
        fs.mkdirSync(userDirectory, { recursive: true }); // Create the directory if it doesn't exist
        cb(null, userDirectory);
    },
    // This function specifies how to name the uploaded file. It uses the original filename of the uploaded file.
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original filename
    },
});

// Creates a multer middleware instance called upload that uses the previously
// defined storage configuration. This middleware will be used to process file uploads.
const upload = multer({ storage: storage });

// Configures Express to parse incoming JSON data from HTTP requests. Its essential 
// when working with JSON-based APIs. It sets up middleware to parse JSON content
// and make it available in the request body as req.body.
app.use(express.json());

// Set the working directory within the Node.js server, not the Docker container
process.chdir(__dirname);

// Defines a POST route handler for the /execute endpoint. It expects a file upload
// with the field name file and handles the request using an asynchronous function.
app.post('/execute', upload.single('file'), async (req, res) => {

    // Extracts the code property from the request body. It assumes that the client
    // has sent a POST request with a JSON body containing a property named code.
    const { code } = req.body;

    // Checks if the req.file property exists. In the context of file uploads, if
    // req.file exists, it means that a file has been uploaded in the request. This code
    // block will only execute if a file has been uploaded.
    if (req.file) {

        // This line constructs a directory path based on the username provided in the request body. 
        // It's assumed that the req.body object contains a property named username. 
        // This path will be used to create a user-specific directory where the uploaded file will be stored.
        const userDirectory = `/submissions/${req.body.username}`;

        // This line constructs the full path to the uploaded file within the user's directory. 
        // It combines the userDirectory and the original filename of the uploaded file to create the full file path.
        const uploadedFilePath = path.join(userDirectory, req.file.originalname);

        // Extracts the base filename from the uploadedFilePath. It will be used for referencing the file within the Docker container. 
        const codeFileName = path.basename(uploadedFilePath, path.extname(uploadedFilePath));

        // Uses the docker.createContainer method from the dockerode library to create a Docker container instance. 
        const container = await docker.createContainer({
            Image: 'my-cpp-app', // Use the image name for your C++ environment
            Tty: true, // Allocate a pseudo-TTY. 
            Detach: true, // Run the container in detached mode. Meaning it will run in the background.
            // Specifies the container's configuration, including volume bindings. 
            // It binds the local submissions directory to the /submissions directory within the container. 
            HostConfig: {
                Binds: [`${__dirname}/submissions:/submissions`], // Mount the submissions directory
            },
        });

        // Start the container
        await container.start();

        // Constructs a path to the user's uploaded code file within the Docker container.
        // It is based on the user's username and the original filename of the uploaded file.
        const sourceCodeFile = `/submissions/${req.body.username}/${req.file.originalname}`;
        // Defines the command that will be executed within the Docker container. It specifies the command as
        // /entrypoint.sh and passes the sourceCodeFile as an argument to the script. 
        const command = `/entrypoint.sh "${sourceCodeFile}"`; // Pass the source code file as an argument

        // Creates an exec instance within the container.
        // The container.exec() method to set up the execution of a 
        // command within the container.
        const exec = await container.exec({
            // Specifies the command to be executed. It runs a bash shell and passes the command
            // as an argument, which effectively executes the entrypoint.sh script with the 
            // sourceCodeFile as input.
            Cmd: ['bash', '-c', command],
            // Indicate that the standard output and error of the command execution should be captured.
            AttachStdout: true,
            AttachStderr: true,
        });

        // Initiates the execution of the command within the container and captures the command's output stream.
        const outputStream = await exec.start();

        // Initializes an empty string to store the command's output.
        let output = '';

        // Sets up a promise-based mechanism to capture the data emitted by the 
        // outputStream as the command executes. The data event is triggered whenever data
        // is received from the command, and this data is appended to the output string.
        await new Promise((resolve) => {
            outputStream.on('data', (data) => {
                output += data.toString();

                // Only thing that I got to fix the spcecial characters.
                // But more advanced code still breaks.
                // output += data.slice(8).toString();
            });

            // End event signals the end of data emission from the command, and it resolves the promise.
            outputStream.on('end', resolve);
        });


        console.log(output);

        // After the command execution and output caputre. Stop the execution of the container.
        await container.stop();

        // Remove the container
        // await container.remove();

        // If there was a file uploaded, it send a JSON response to the client. It uses the res.json()
        // method to send a JSON object as the response.
        res.json({ result: 'Success', output });

        // If there was no file uploaded, meaning that req.file is falsy (e.g., if the client didn't include a file in the request), 
        // the code inside the else block is executed.
    } else {
        res.json({ result: 'Error', error: 'No file uploaded.' });
    }
});

// Starts the Express.js server by calling the app.listen() method, which makes the server listen on the specified port.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




