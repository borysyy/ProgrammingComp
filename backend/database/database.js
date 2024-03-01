const path = require('path')
const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')
const DATABASE = path.resolve('./database/database.db')
let sql

//connect to db
const db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message)
  } else {
    return console.log('Database opened')
  }
})

//updates table
function updateUsersTable(username, password, email) {
  try {
    sql =
      "INSERT INTO users (username, password, email, teamname) VALUES ('" +
      username +
      "', '" +
      password +
      "', '" +
      email +
      "', null);"
    db.run(sql)
  } catch (e) {
    if (e == SQLITE_CONSTRAINT) {
      return 400
    }
    console.log('***ERROR: ' + e)
    return 400
  }
  return 200
}

function checkLogin(email) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT password FROM users WHERE email = '" + email + "';"
    return db.get(sql, (err, res) => {
      if (err) {
        console.error('DB Error: Could not find email: ', err.message)
        return reject(err.message)
      }
      return resolve(res.password)
    })
  })
}

function updateTeamTable(teamName, allEmails, cntEmails) {
  let sql = ''
  try {
    sql = "INSERT INTO teams (teamName) VALUES ('" + teamName + "');"
    db.run(sql)
    for (let i = 0; i < cntEmails; ++i) {
      console.log(allEmails[i].email)
      sql =
        "UPDATE users SET teamname = '" +
        teamName +
        "' WHERE email = '" +
        allEmails[i].email +
        "';"
      db.run(sql)
    }
  } catch (e) {
    console.log('***ERROR ' + e)
    return 400
  }
  return 200
}

module.exports = {
  router,
  updateUsersTable,
  checkLogin,
  updateTeamTable,
}
