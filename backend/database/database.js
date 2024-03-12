const path = require('path')
const express = require('express')
const { error } = require('console')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
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
function createUser(username, password, email) {
  return new Promise((resolve, reject) => {
    // Check if email is already in use
    const checkSql = 'SELECT COUNT(*) AS count FROM users WHERE email = ?'
    db.get(checkSql, [email], (error, row) => {
      if (error) {
        reject(error) // Reject if there's an error in the database query
      } else {
        if (row.count > 0) {
          resolve({ success: false, reason: 'Email already in use' })
        } else {
          // Proceed with the insertion
          const insertSql =
            'INSERT INTO users (username, password, email, teamname) VALUES (?, ?, ?, null);'
          db.run(insertSql, [username, password, email], (error) => {
            if (error) {
              reject(error) // Reject if there's an error during insertion
            } else {
              resolve({ success: true })
            }
          })
        }
      }
    })
  })
}

function getUser(email) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE email = '" + email + "';"
    return db.get(sql, (err, user) => {
      if (err) {
        return reject(err.message)
      }
      return resolve(user)
    })
  })
}

function createTeam(teamname, members) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO teams (teamname, members) VALUES (?, ?);',
      [teamname, members.join()],
      (error) => {
        if (error) {
          reject(error) // Reject if there's an error during insertion
        } else {
          resolve({ success: true })
        }
      }
    )
  })
}

module.exports = {
  router,
  createUser,
  getUser,
  createTeam,
}
