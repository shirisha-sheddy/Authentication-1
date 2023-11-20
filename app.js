const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

let db = null;
const databasePath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const validatePassword = (password) => {
  return password.length > 4;
};

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = ${username};`;
  const databaseUser = await db.get(selectUserQuery);

  if (databaseUser === undefined) {
    const createUserQuery = `
          INSERT INTO user (username, name, password, gender, location)
          VALUES 
          (
              '${username}',
              '${name}',
              '${hashedPassword};,
              '${gender}',
              '${location}',
          );
        `;
    if (validatePassword(password)) {
      await db.run(createUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

module.exports = app;
