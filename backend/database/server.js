const sqlite3 = require("sqlite3").verbose();
const DATABASE = './SUNYPolyCompetitiveProgramming.db'
let sql;

class SPCP{
	SPCP(){
		//connect to db
		const db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READWRITE, (err) =>{
			if (err){
				return console.error(err.message);
			}
		});
	}

	//create default table
	createTables = () => {
		sql = 'CREATE TABLE users (user_id INTEGER PRIMARY KEY, username VARCHAR(64) NOT NULL, password VARCHAR(64) NOT  NULL,'
		sql += ' email VARCHAR(255) NOT NULL, teamname DEFAULT NULL);';
		db.run(sql);
	}

	//updates table
	updateUsersTable = (username, password, email) => {
		sql = 'INSERT INTO users (username, password, email) VALUES ' + username + ', ' + password + ', ' + email + ');'
		db.run();
	}
}

module.exports = SPCP;