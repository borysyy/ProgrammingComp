const path = require('path');
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

exports.updateUsersTable = updateUsersTable;
