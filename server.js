const express = require('express');
const cookieParser = require('cookie-parser');
const https = require("https");
const bcrypt = require("bcrypt");
const path = require('path');
const fs = require("fs");
const bodyParser = require('body-parser');
const crypto = require("crypto");
const db = require("./database");
const app = express();
// const router = express.Router();
require("dotenv").config();

// Initial Configurations And Setup 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '/public')));
db.connect();
app.set('views', path.join(__dirname, '/public'))
app.set('view engine', 'ejs');
app.use(cookieParser());


const route = require("./server/routes/route");
app.use(route);


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
