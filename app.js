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
    }
  });
});

//registration
app.post("/register", (req, res) => {
  const { firstname, lastname, studentId, email, password } = req.body;
  console.log(req.body.firstname);
  db.run(
    "INSERT INTO users (firstname, lastname, studentId, email, password) VALUES (?, ?, ?, ?, ?)",
    [firstname, lastname, studentId, email, password],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).send("Registration successful");
      }
    }
  );
});

app.listen(3000, () => {
  console.log("App started..!");
});
