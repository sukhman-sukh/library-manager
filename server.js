const express = require('express');
const https = require("https");
const bcrypt = require("bcrypt");
const path = require('path');
const fs = require("fs");
const bodyParser = require('body-parser');
const crypto = require("crypto");
const db = require("./database");
const NodeRSA = require('node-rsa');
const app = express();
// const router = express.Router();
require("dotenv").config();

// Initial Configurations And Setup 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '/public')));
db.connect();
app.set("view engine", "ejs");
// app.use('/', router);




async function hashPassword(password) {
    console.log("started hashing")
    const saltRounds = 5;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    console.log("hashed")
    return {
        salt: salt,
        hash: hash
    };
}


app.get("/", function (req, res, next) {
    res.sendFile(__dirname + "/public/screens/index.html");
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/screens/register.html");
});


app.post("/api", (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    console.log(req.body)
    console.log(username + " || " + password)

});


// app.post("/register", (req, res) => {

//     let username = req.body.username;
//     let password = req.body.password;
//     console.log(req.body)
//     console.log(username + " || " + password)

// });


app.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(username + ' \\ ' + password);
    db.query(
        `SELECT * FROM users WHERE userName = ${db.escape(username)};`,
        (err, row, field) => {
            if (err) {
                throw err
            }
            else {
                //check if result is a list or not
                console.log(row[0])
                let hash = crypto.createHash("sha256").update(password + row[0].SALT).digest("base64");
                //console.log(hash)
                if (hash === row[0].hash) {
                    console.log(` Logging in into ${username}`);
                    //console.log(result[0].ID);

                    if (row[0].admin === 1) {
                        console.log("admin")
                        // res.redirect("/adminPage")
                    }
                    else {
                        console.log("not admin")
                        // res.redirect("/clientPage");
                    }
                }
                else if (hash !== row[1]) {
                    console.log(`Incorrect login attempt for ${username}`);
                    res.render('/', { data: "Incorrect ID or Password" });
                }
                else {
                    console.log("Some Unexpected Error Occured!");
                }
            }
        }
    )
});

app.post("/register", (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let reqAccess = req.body.adminAccess;
    console.log(username + ' \\ ' + password + 'and '+ reqAccess)
    
    db.query(
        "SELECT salt,hash,id, admin,userName from users where userName = " + db.escape(username) + ";",
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                var pass = hashPassword(password);

                if (result[0] === undefined) {
                    console.log("trying to access database ....")
                    db.query(
                        `INSERT INTO users (userName, hash, salt, admin) VALUES(${db.escape(username)},'${pass.hash}','${pass.salt}', 0);`
                    );
                    
                        console.log(result[0].id)
                    console.log("done")
                    res.sendFile(__dirname + "/public/screens/index.html");
                    // res.render("");

                } else {
                    res.send("Username is not unique");
                }
            }
        }
    );
});

const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

// Creating https server by passing
// options and app object
https.createServer(options, app)
    .listen(PORT, function (req, res) {
        console.log("Server started at port " + PORT);
    });
