const path = require('path');
const express = require('express')
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const DATABASE = path.resolve(__dirname, "database.db")
let sql;


//connect to db
const db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READWRITE, (err) =>{
	if (err){
		return console.error(err.message);
	}
	else{
		return console.log("Database opened");
	}
});

//updates table
function updateUsersTable(username, password, email){
	try{
		sql = "INSERT INTO users (username, password, email, teamname) VALUES ('" + username + "', '" + password + "', '" + email + "', null);";
		db.run(sql);
	}
	catch (e){
		if (e == SQLITE_CONSTRAINT){
			return 400;
		}
		console.log ("***ERROR: " + e);
		return 400;
	}
	return 200;
}

//check the username and the password for the database
function checkLogin(email){
	let password = "";
	sql = "SELECT password FROM users WHERE email = '" + email + "';"
	console.log("SQL STRING: " + sql);
	password = db.get(sql);
	password = JSON.stringify(password);
	console.log(password);
	return password;
}


module.exports = {
	router,
	updateUsersTable,
	checkLogin,
}