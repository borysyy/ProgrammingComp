const path = require("path");
const express = require("express");
const { error } = require("console");
const { rejects } = require("assert");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const DATABASE = path.resolve("./database/database.db");
let sql;

//connect to db
const db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  } else {
    return console.log("Database opened");
  }
});

//updates table
function createUser(username, password, email) {
  return new Promise((resolve, reject) => {
    // Check if email is already in use
    const checkSql = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
    db.get(checkSql, [email], (error, row) => {
      if (error) {
        reject(error); // Reject if there's an error in the database query
      } else {
        if (row.count > 0) {
          resolve({ success: false, reason: "Email already in use" });
        } else {
          // Proceed with the insertion
          const insertSql =
            "INSERT INTO users (username, password, email) VALUES (?, ?, ?);";
          db.run(insertSql, [username, password, email], (error) => {
            if (error) {
              reject(error); // Reject if there's an error during insertion
            } else {
              resolve({ success: true });
            }
          });
        }
      }
    });
  });
}

function getUser(email) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE email = ?;";
    return db.get(sql, [email], (err, user) => {
      if (err) {
        return reject(err.message);
      }
      return resolve(user);
    });
  });
}

function getTeam(email, semester, year) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT (ID) FROM competitions WHERE semester = ? AND year = ?;",
      [semester, year],
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during insertion
        } else {
          return db.get(
            "SELECT teamname, score, members FROM teams WHERE members LIKE ? AND competition_ID = ?;",
            [`%${email}%`, result.ID],
            (err, result) => {
              if (err) {
                return reject(err.message);
              }
              return resolve(result);
            }
          );
        }
      }
    );
  });
}

function createTeam(teamname, members, semester, year) {
  return new Promise((resolve, reject) => {
    // if (members.length > 4) {
    //   reject(new Error("Number of members should be 4 or less."));
    //   return;
    // }
    db.get(
      "SELECT (ID) FROM competitions WHERE semester = ? AND year = ?;",
      [semester, year],
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during insertion
        } else {
          db.run(
            "INSERT INTO teams (teamname, members, competition_ID) VALUES (?, ?, ?);",
            [teamname, members.join(), result.ID],
            (error) => {
              if (error) {
                reject(error); // Reject if there's an error during insertion
              } else {
                resolve({ success: true });
              }
            }
          );
        }
      }
    );
  });
}

function getProblems(semester, year) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT (ID) FROM competitions WHERE semester = ? AND year = ?;",
      [semester, year],
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during insertion
        } else {
          return db.all(
            "SELECT problem_num, problem_name FROM problems WHERE competition_ID = ?;",
            [result.ID],
            (err, result) => {
              if (err) {
                return reject(err.message);
              }
              return resolve(result);
            }
          );
        }
      }
    );
  });
}

function recordSubmission(semester, year, username, teamname, problem_name) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT (ID) FROM competitions WHERE semester = ? AND year = ?;",
      [semester, year],
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during insertion
        } else {
          const competition_ID = result.ID;
          db.get(
            "SELECT count(*) as count FROM submissions WHERE competition_ID = ? AND teamname = ? AND username = ? AND problem_name = ?;",
            [competition_ID, teamname, username, problem_name],
            (error, result) => {
              if (error) {
                reject(error); // Reject if there's an error during insertion
              } else {
                if (result.count == 0) {
                  return db.run(
                    "INSERT INTO submissions VALUES (?,?,?,?)",
                    [competition_ID, teamname, username, problem_name],
                    (error) => {
                      if (error) {
                        reject(error); // Reject if there's an error during insertion
                      } else {
                        resolve({ success: true });
                      }
                    }
                  );
                } else {
                  resolve({ success: true });
                }
              }
            }
          );
        }
      }
    );
  });
}

function getSubmission(semester, year, teamname) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT (ID) FROM competitions WHERE semester = ? AND year = ?;",
      [semester, year],
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during insertion
        } else {
          return db.all(
            "SELECT username, problem_name FROM submissions WHERE competition_ID = ? AND teamname = ?;",
            [result.ID, teamname],
            (err, result) => {
              if (err) {
                return reject(err.message);
              }
              return resolve(result);
            }
          );
        }
      }
    );
  });
}

function getScore (teamname, semester, year){
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT (ID) FROM competitions WHERE semester = ? AND year = ?;",
      [semester, year],
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during insertion
        } else {
          return db.all(
            "SELECT score FROM teams WHERE competition_ID = ? AND teamname = ?;",
            [result.ID, teamname],
            (err, result) => {
              if (err) {
                return reject(err.message);
              } else {
              return resolve(result);
              }
            }
          );
        }
      }
    );
  });
}

function updateScore(teamname, semester, year, score){
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT (ID) FROM competitions WHERE semester = ? AND year = ?;",
      [semester, year],
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error during insertion
        } else {
          return db.run(
            "UPDATE teams SET score = ? WHERE competition_ID = ? AND teamname = ?",
            [score, result.ID, teamname],
            (err, result) => {
              if (err) {
                return reject(err.message);
              } else {
                return resolve({success : true});
              }
            }
          );
        }
      }
    );
  });
}

module.exports = {
  router,
  createUser,
  getUser,
  createTeam,
  getTeam,
  getProblems,
  recordSubmission,
  getSubmission,
  getScore,
  updateScore,
};
