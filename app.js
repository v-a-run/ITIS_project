const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("user.db");
const bodyParser = require("body-parser");

app.use(express.static(__dirname + "/public"));
app.engine("html", require("ejs").renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("home.html");
});

app.get("/register", (req, res) => {
  res.render("register.html");
});

app.get("/login", (req, res) => {
  res.render("login.html");
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body.email);
  db.get("SELECT * FROM users WHERE email = ?", email, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else if (!row) {
      res.status(401).send("Invalid username");
    } else if (row.password !== password) {
      res.status(401).send("Invalid password");
    } else {
      res.status(200).send("Login successful");
      db.close();
    }
  });
});

//registration
app.post("/register", (req, res) => {
  const { firstname, lastname, studentId, email, password } = req.body;

  // check if studentId already exists
  findAllstudentId_query = "SELECT * FROM users WHERE studentId = ?";
  db.all(findAllstudentId_query, [studentId], (err, rows) => {
    if (err) {
      console.error(err);
    } else if (rows) {
      let flag = true;
      rows.forEach((row) => {
        if (row.studentId === studentId) {
          flag = false;
        }
      });

      // studentId doesn't exists -> registered successfully
      if (flag) {
        insertData_query =
          "INSERT INTO users (firstname, lastname, studentId, email, password) VALUES (?, ?, ?, ?, ?)";
        db.run(
          insertData_query,
          [firstname, lastname, studentId, email, password],
          function (err) {
            if (err) {
              console.error(err);
              res.status(500).send("Internal Server Error");
            } else {
              //find userId through studentId and
              //insert transcript and certificate file_names in db
              getUserId_query = "SELECT userId FROM users WHERE studentId = ?";
              db.get(getUserId_query, studentId, (err, { userId }) => {
                transcript_name = userId + "_transcript";
                certificate_name = userId + "_cert";
                updateFilenames_query =
                  "UPDATE users SET transcript = ?, certificate = ? WHERE studentId = ?";
                db.run(
                  updateFilenames_query,
                  [transcript_name, certificate_name, studentId],
                  (err, rows) => {
                    console.log(`rows`, rows);
                    db.close();
                  }
                );
              });
              res.status(200).send("Registration successful");
            }
          }
        );
      } else {
        // studentId already exists -> show Error
        res
          .status(401)
          .send(
            "Student ID already registered. Register with new student ID or login with existing student ID."
          );
      }
    }
  });
});

app.listen(3000, () => {
  console.log("App started..!");
});
