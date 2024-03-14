// Import required modules
const express = require("express"); // Express framework for Node.js web applications
const multer = require("multer"); // Middleware for handling multipart/form-data
const bodyParser = require("body-parser"); // Parse incoming request bodies
const fs = require("fs"); // File system module for interacting with the file system
const bcrypt = require("bcryptjs"); // Library for hashing passwords
const SPCP = require("./database/database.js"); // Custom module for interacting with the database
const Queue = require("bull"); // Library for managing job queues
const Docker = require("dockerode"); // Node.js Docker API library
const session = require("express-session"); // Session middleware for Express
const passport = require("passport"); // Authentication middleware for Node.js
const LocalStrategy = require("passport-local"); // Local authentication strategy for Passport
const path = require("path"); // Utility for working with file and directory paths
const flash = require("express-flash"); // Flash messages middleware for Express

// Initialize Express app
const app = express();

// Set up Docker client
const docker = new Docker();

// Create job queue for code execution
const codeQueue = new Queue("code-queue");

// Define port
const port = 3000;

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Set view engine to EJS
app.set("view engine", "ejs");

// Parse JSON and text/plain request bodies
app.use(
  express.json({
    type: ["application/json", "text/plain"],
  })
);

// Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(
  session({
    secret: "confer",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use(flash());

app.use(bodyParser.json());

// Passport local strategy for authenticating users
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await SPCP.getUser(email);
        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
          return done(null, {
            username: user.username,
            email: user.email,
          });
        } else {
          throw new Error();
        }
      } catch (error) {
        console.log("Invalid username or password");
        req.flash("error", "Invalid username or password");
        return done(null, false);
      }
    }
  )
);

// Serialize user object
passport.serializeUser((user, done) => done(null, user));

// Deserialize user object
passport.deserializeUser((user, done) => done(null, user));

// Route for displaying login page
app.get("/login", (req, res) => {
  const errorMessages = req.flash("error");
  const messages = req.flash("message");
  const successMessages = req.flash("success");
  res.render("login", { errorMessages, messages, successMessages });
});

// Route for handling login
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get(
  "/",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  (req, res) => {
    res.render("index");
  }
);

// Route for displaying submissions page
app.get(
  "/submit",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  (req, res) => {
    res.render("submit", { user: req.user });
  }
);

app.get(
  "/submissions/:semester/:year",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  async (req, res) => {
    const team = await SPCP.getTeam(
      req.user.email,
      req.params.semester,
      req.params.year
    );
    res.render("submissions", { user: req.user, team });
  }
);

// Route for logging out
app.post("/logout", (req, res, next) =>
  req.logout((error) => {
    if (error) return next(error);
    req.flash("message", "Logged Out");
    res.redirect("/login");
  })
);

// Route for displaying registration page
app.get(
  "/register",
  (req, res, next) => {
    if (!req.isAuthenticated()) return next();
    res.redirect("/");
  },
  (req, res) => {
    const errorMessages = req.flash("error");
    const messages = req.flash("message");
    const successMessages = req.flash("success");

    res.render("register", { errorMessages, messages, successMessages });
  }
);

// Route for registering users
app.post("/register", async (req, res) => {
  const { email, username, password, password_confirm } = req.body;
  if (password != password_confirm) {
    req.flash("error", "Passwords do not match, please recheck your passwords");
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const result = await SPCP.createUser(username, hashedPassword, email);

    if (result.success) {
      req.flash("success", "Account created successfully");
      return res.redirect("/login");
    } else {
      req.flash("error", result.reason);
      return res.redirect("/register");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    req.flash("error", "An error occurred while creating user");
    return res.redirect("/register");
  }
});

// Route for display register team page
app.get(
  "/registerteam",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  (req, res) => {
    const errorMessages = req.flash("error");
    const messages = req.flash("message");
    const successMessages = req.flash("success");
    res.render("registerTeam", {
      errorMessages,
      messages,
      successMessages,
      email: req.user.email,
    });
  }
);

// Route for registering team in the database
app.post(
  "/registerteam",

  async (req, res) => {
    const teamname = req.body.teamname;
    const members = Array.isArray(req.body.email)
      ? req.body.email
      : [req.body.email];

    try {
      const result = await SPCP.createTeam(teamname, members, "spring", 2024);

      console.log(result);

      if (result.success) {
        req.flash("success", "Team created successfully");
        return res.redirect("/submit");
      } else {
        req.flash("error", result.reason);
        return res.redirect("/registerteam");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      req.flash("error", "An error occurred while creating team");
      return res.redirect("/registerteam");
    }
  }
);

// Route for displaying user information
app.get(
  "/user",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  (req, res) => {
    res.send(req.user);
  }
);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware to redirect unauthenticated users to login page
app.use((req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}, express.static(path.join(__dirname, "dist")));

const codeExecutionDir = `${__dirname}/codeExecution`;

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDirectory = `${codeExecutionDir}/submissions/${req.user.username}`;
    fs.mkdirSync(userDirectory, { recursive: true });
    cb(null, userDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Set up multer middleware for file uploads
const upload = multer({ storage: storage });

// Handle POST request to '/execute' endpoint
app.post("/execute", upload.single("file"), async (req, res) => {
  const username = req.user.username;
  // const userDirectory = `/submissions/${username}`
  const outputDirectory = `${codeExecutionDir}/output/${username}`;

  // Create user-specific directories
  try {
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
  } catch (err) {
    console.error(err);
  }

  if (req.file) {
    const sourceCodeFile = `/submissions/${req.user.username}/${req.file.originalname}`;
    const command = ["/entrypoint.sh", req.user.username, sourceCodeFile];

    // Add a job to the queue
    codeQueue.add({
      username,
      command,
      outputDirectory,
    });
  }
});

// Process the jobs
codeQueue.process(async (job, done) => {
  console.log("Processing job:", job.id);

  const { username, command, outputDirectory } = job.data;

  // Create a Docker container
  const container = await docker
    .createContainer({
      Image: "code-execute",
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
      Detach: true,
      HostConfig: {
        Binds: [
          `${codeExecutionDir}/submissions:/submissions`,
          `${codeExecutionDir}/output:/output`,
        ],
      },
    })
    .catch((err) => console.error("Error creating the container:", err));

  console.log("Container created:", container.id);

  // Start the container
  await container
    .start()
    .catch((err) => console.error("Error starting the container:", err));

  // Stop and remove the container after execution
  const containerData = await container.inspect();
  if (containerData.State.Running) {
    await container.stop();
  }
  await container.remove();

  // Read output file and send data as response
  try {
    const compilerOutput = fs.readFileSync(
      `${outputDirectory}/${username}_compiler_output.txt`,
      "utf-8"
    );

    const programOutput = fs.readFileSync(
      `${outputDirectory}/${username}_program_output.txt`,
      "utf-8"
    );
    done(null, { compilerOutput, programOutput });
  } catch (err) {
    console.error("Error reading the file:", err);
  }
});
