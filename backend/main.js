// main.js
const express = require('express');
const app = express();
const port = 3000;

// Import your index.js and server.js
const index = require('./index');
const server = require('./codeExecution/server');

// Use them as middleware
app.use('/', index);
app.use('/server', server);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
