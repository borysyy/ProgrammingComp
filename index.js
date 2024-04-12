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

async function clearQueue() {
  await codeQueue.empty();
  console.log("Queue cleared.");
}

clearQueue().catch(console.error);

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

// Code execution directory variable
const codeExecutionDir = `${__dirname}/codeExecution`;

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

// Route for the root page
app.get(
  "/",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  (req, res) => {
    const errorMessages = req.flash("error");
    const messages = req.flash("message");
    const successMessages = req.flash("success");
    res.render("index", { errorMessages, messages, successMessages });
  }
);

// Route for the submissions page
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

    const submissions = await SPCP.getSubmission(
      req.params.semester,
      req.params.year,
      team.teamname
    );

    for (const submission of submissions) {
      const year = req.params.year;
      const semester = req.params.semester;
      const problem_name = submission.problem_name;
      const teamname = team.teamname;
      const username = submission.username;

      const outputDirectory = `${codeExecutionDir}/output/${year}/${semester}/${problem_name}/${teamname}/${username}`;

      try {
        const compilerOutput = fs.readFileSync(
          `${outputDirectory}/compiler_output.txt`,
          "utf-8"
        );

        const programOutput = fs.readFileSync(
          `${outputDirectory}/program_output.txt`,
          "utf-8"
        );

        const scoreOutput = fs.readFileSync(
          `${outputDirectory}/score_output.txt`,
          "utf-8"
        );

        submission.compilerOutput = compilerOutput;
        submission.programOutput = programOutput;
        submission.scoreOutput = scoreOutput;
      } catch (err) {
        console.error("Error reading the file:", err);
      }
    }
    res.render("submissions", { user: req.user, team, submissions });
  }
);

// Route for the problems page
app.get(
  "/problems/:semester/:year",
  (req, res, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.redirect("/login"); // Redirect to login if not authenticated
    }

    // Check if user is in a team
    SPCP.getTeam(req.user.email, req.params.semester, req.params.year)
      .then((team) => {
        if (team) {
          // User is in a team, proceed to next middleware
          return next();
        } else {
          req.flash("error", "Please register for a team first");
          return res.redirect("/");
        }
      })
      .catch((error) => {
        console.error("Error checking team membership:", error);
      });
  },
  async (req, res) => {
    // If control reaches here, user is in a team
    const problems = await SPCP.getProblems(
      req.params.semester,
      req.params.year
    );
    res.render("problems", {
      user: req.user,
      problems,
    });
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
  const emailExpression = new RegExp("^[a-zA-Z0-9]{1,}@sunypoly.edu$");
  const passwordExpression = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"
  );

  let index = email.indexOf("@");
  let allowedUsername = 0;

  if (index !== -1) {
    allowedUsername = email.slice(0, index);
  }

  if (username !== allowedUsername) {
    req.flash(
      "error",
      "Username must be your SUNY Poly userID ex: [userID]@sunypoly.edu"
    );
    return res.redirect("/register");
  }

  if (emailExpression.test(email) === false) {
    req.flash("error", "Email must be a valid SUNY Poly email");
    return res.redirect("/register");
  }

  if (passwordExpression.test(password) === false) {
    req.flash(
      "error",
      "Password: Minimum eight characters, at least one uppercase letter, one lowercase letter and one number"
    );
    return res.redirect("/register");
  }

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
    const maxMembers = 4;
    const emailExpression = new RegExp("^[a-zA-Z]{1,10}@sunypoly.edu$");

    try {
      for (let i = 0; i < members.length; i++) {
        if (emailExpression.test(members[i]) === false) {
          req.flash(
            "error",
            "Each team member must have a valid SUNY Poly email"
          );
          return res.redirect("/registerteam");
        }
      }

      if (members.length > maxMembers) {
        req.flash("error", "Maximum team size exceeded");
        return res.redirect("/registerteam");
      }

      const result = await SPCP.createTeam(teamname, members, "spring", 2024);

      if (result.success) {
        req.flash("success", "Team created successfully");
        return res.redirect("/");
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

app.post("/submit", upload.array("file"), async (req, res) => {
  const email = req.user.email;
  const username = req.user.username;
  const semester = req.body.semester;
  const year = req.body.year;
  const teamname = (await SPCP.getTeam(email, semester, year)).teamname;
  const TotalScore = (await SPCP.getTeam(email, semester, year)).score;
  const problems = JSON.parse(req.body.problems);
  const problem_name = problems[req.body.index].problem_name;
  const numberOfProblems = Object.keys(problems).length;
  let scores = [];
  const judgingDirectory = `/judgeProgs`;
  const judging_program = `${judgingDirectory}/${
    problems[req.body.index].judge
  }.py`;
  const testFilesDirectory = `/testFiles`;
  const test_file = `${testFilesDirectory}/${
    problems[req.body.index].test_file
  }.dat`;

  const outputDirectory = `${codeExecutionDir}/output/${year}/${semester}/${problem_name}/${teamname}/${username}`;

  // Create user-specific directories
  try {
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
  } catch (err) {
    console.error(err);
  }

  console.log("req.file = ", req.files);

  let filePaths = [];

  if (req.files) {
    filePaths = req.files.map(
      (file) => `/submissions/${req.user.username}/${file.originalname}`
    );
  }

  const command = ["/entrypoint.sh", ...filePaths, judging_program, test_file];

  codeQueue.add({
    command,
    outputDirectory,
    semester,
    year,
    username,
    teamname,
    problem_name,
  });

  let judge = 0;
  for (let i = 0; i < numberOfProblems; ++i) {
    scores[i] = await SPCP.getHighestScoreForProblem(
      semester,
      year,
      teamname,
      problem_name
    );
    judge += scores[i];
    console.log(i + ": " + JSON.stringify(scores[i]));
  }

  if (TotalScore < judge) {
    await SPCP.updateScore(teamname, semester, year, judge);
  }

  res.sendStatus(200);
});

// Process the jobs
codeQueue.process(async (job, done) => {
  // Register event listener for job completion

  console.log("Processing job:", job.id);

  const {
    command,
    outputDirectory,
    semester,
    year,
    username,
    teamname,
    problem_name,
  } = job.data;

  // Create a Docker container
  try {
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
            `${outputDirectory}:/output`,
            `${codeExecutionDir}/judgeProgs:/judgeProgs`,
            `${codeExecutionDir}/testFiles:/testFiles`,
          ],
        },
      })
      .catch((err) => console.error("Error creating the container:", err));
    //
    console.log("Container created:", container.id);

    // Start the container
    try {
      await container
        .start()
        .catch((err) => console.error("Error starting the container:", err));

      await container.wait();

      await container.remove();

      const scoreOutput = fs.readFileSync(
        `${outputDirectory}/score_output.txt`,
        { encoding: "utf-8" }
      );

      console.log(
        semester,
        year,
        username,
        teamname,
        problem_name,
        scoreOutput
      );

      await SPCP.recordSubmission(
        semester,
        year,
        username,
        teamname,
        problem_name,
        scoreOutput
      );

      done();
    } catch (err) {
      console.log("Could not start container: ", err);
      return done(err);
    }
  } catch (err) {
    console.log("Could not create container: ", err);
    return done(err);
  }
});

codeQueue.on("completed", (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});
