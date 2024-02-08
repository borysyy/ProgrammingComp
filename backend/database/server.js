//server variables
const express = require("express");
const cors = require("cors");
const lowDB = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const bodyParser = require("body-parser");
const PORT = 3001;

//initialize the database
const db = lowDB(new FileSync('database.json'));

//set the defaults of the database
db.defaults({users:[]}).write();

//set up the express instance
const app = express();
app.use(cors);
app.use(bodyParser.json());

//set up the url handlers
//will be used to check if the suer is in the database
app.get('/Login/auth', async (req, res) => {
	const data = db.get("users").value();
	return res.json(data);
});

//will be used to put a new user in the database
app.post("/CreateAccount/register", async (req, res) => {
	const account = req.body;
	db.get("users").push({
		...account
	});
	res.json({success : true});
});



app.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
});
