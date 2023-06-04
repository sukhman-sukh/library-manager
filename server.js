const express = require('express');
const cookieParser = require('cookie-parser');
const https = require("https");
const bcrypt = require("bcrypt");
const path = require('path');
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require('body-parser');
const crypto = require("crypto");
const db = require("./database");
const NodeRSA = require('node-rsa');
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

async function authenticate(res, username, password, row) {
    const hash = await bcrypt.hash(password, row[0].salt);
    //check if result is a list or not 
    if (row[0] != undefined) {
        console.log(row[0])
        // let hash = crypto.createHash("sha256").update(password + row[0].salt).digest("base64");
        console.log(hash)
        if (hash == row[0].hash) {
            console.log(` Logging in into ${username}`);
            //console.log(result[0].ID);
            let sessionID = crypto.randomBytes(20).toString('hex');
            res.cookie("sessionID", sessionID, {
                maxAge: 86400,
                httpOnly: true,

            });
            console.log("cookie generated");
            // `SELECT sessionId, userId FROM cookie`;
            console.log(sessionID);

            db.query(`SELECT * FROM cookie`, (err, result) => {
                // console.log(result[0]);
                if (result[0] == undefined) {
                    console.log("Table was null")
                    db.query(`INSERT INTO cookie (sessionId , userId) VALUES(${db.escape(sessionID)}, ${db.escape(row[0].id)} );`);
                }
                else {
                    db.query(
                        `UPDATE cookie SET sessionId = ${db.escape(sessionID)} , userId = ${db.escape(row[0].id)}`,
                        (err) => {
                            if (err) {
                                console.error(err)
                            }
                        });
                }
            })


            if (row[0].admin == 1) {
                console.log("admin")
                res.redirect("/admin");
            }
            else {
                console.log("not admin")
                // renderClient();
                res.redirect("/client");
            }
        }
        else if (hash !== row[1]) {
            console.log(`Incorrect login attempt for ${username}`);
            res.render('views/index', { data: "Incorrect ID or Password" });
        }
        else {
            console.log("Some Unexpected Error Occured!");
        }
    }
    else {
        console.log(`Incorrect login attempt for ${username}`);
        // res.render('./public/screens/login.html', { data: "Incorrect ID or Password" });
        res.render("views/index", { data: "Incorrect ID or Password" });
    }
}

// SELECT cookie.sessionId, cookie.userId, users.admin FROM cookie, users WHERE sessionId = 'd7d11b7ec9c5332262f4f9f00dce039be87824c3' AND users.id = 10;
//Creating Middleware
function validateCookies(req, res, next) {
    req.adminAuth = 0;

    const cookieId = req.headers.cookie.slice(10);
    console.log(cookieId)
    if (req.headers.cookie.includes("sessionID")) {
        db.query(
            `SELECT cookie.sessionId, cookie.userId, users.admin , users.userName FROM cookie, users WHERE sessionId = ${db.escape(cookieId)} AND users.id = cookie.userId;`,
            (err, result) => {

                console.table(result);
                if (err) {
                    throw err;
                }
                else {
                    console.log(result[0]);
                    console.log(cookieId)
                    if (result[0].admin === 1) {
                        req.adminAuth = 1;
                    }
                    else {
                        req.adminAuth = 0;
                    }

                    if (cookieId == result[0].sessionId) {
                        req.userID = result[0].userId;
                        req.userName = result[0].userName;
                        // console.log(req.userID + "   hehehe  "+req.userName);
                        console.log("cookie validated ")
                        next();
                    }
                    else {
                        res.status(403).send({ 'msg': 'Not Authenticated' });
                    }
                }
            }
        )
    }
    else {
        res.status(403).send({ 'msg': 'Not Authenticated' });
    }
}

function isAdmin(req, res, next) {
    if (req.adminAuth === 1) {
        next();
    }
    else {
        res.status(403).send({ 'msg': 'Not Authenticated' });
    }
}

app.get("/logout", validateCookies, (req, res) => {
    req.headers.cookie = null
    console.log("inside logout")
    db.query(
        `DELETE FROM cookie WHERE userId = ${db.escape(req.userID)};`,
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                console.log("here");
                res.redirect("/login");
                // res.render("views/index", { data: "heh" });
                console.log("==========================");
                // res.send("User Signed out successfully!");
            }
        }
    )
});


app.get("/login", function (req, res) {
    res.render("views/index", { data: "." });
    // res.sendFile(__dirname + "/public/screens/index.html");
});


app.get("/", function (req, res) {

    console.log(req.headers.cookie);
    if (req.headers.cookie == undefined) {
        // res.render("views/index", { data: "." });
        res.redirect("/login")
    }
    else {
        validateCookies();
        if (req.adminAuth == 1) {
            // res.render("views/index", { data: "." });
            res.redirect("/admin");
        }
        else {
            res.redirect("/client")
        }

    }

    // res.sendFile(__dirname + "/public/screens/index.html");
});

app.get("/register", (req, res) => {
    res.render("views/register", { data: "Incorrect ID or Password" });
    // res.sendFile(__dirname + "/public/screens/register.html");
});

app.get("/admin/checkin", (req, res) => {

    res.render("views/checkin");
    // res.sendFile(__dirname + "/public/screens/register.html");
});


app.get("/admin/add", (req, res) => {
    console.log("inside add")
    res.render("views/addBooks", { data: "Incorrect ID or Password" });
    // res.sendFile(__dirname + "/public/screens/register.html");
});

app.post("/admin/add",  (req, res) => {
    // console.log(req);
    let bookname = req.body.bookname;
    let Author = req.body.Author;
    let Copies = req.body.Copies;
    console.log(bookname + ' \\ ' + Author + ' // '+ Copies);

    db.query(
        `SELECT * FROM books_record WHERE bookName = ${db.escape(bookname)}`,
        (err,result)=>{
            if(result[0] == undefined){
                db.query(
                    `INSERT INTO books_record (bookName, author, copies) VALUES(${db.escape(bookname)},${db.escape(Author)} ,${db.escape(Copies)} );`
                );
            }
            else{
                console.log("hehhehhheh");
                let FinalCopies = parseInt(Copies)+ parseInt(result[0].copies)
                db.query(
                `UPDATE books_record SET copies = ${db.escape(FinalCopies)} WHERE bookName = ${db.escape(bookname)}`
    );}
        }
    )
   
    res.redirect("/admin");
});

app.get("/admin/remove/", (req, res) => {

   
    // console.log("inside remove")
    // data = [{bookId: bookId ,  copies: copies}]
    
    // console.log(data)
    
    res.render("views/removeBooks");}
    // res.sendFile(__dirname + "/public/screens/register.html");
);

app.post("/admin/remove",  (req, res) => {
    // console.log(req);
    let bookId = req.body.bookId;
    let copies = req.body.Copies;
    console.log(bookId + ' '+ copies);
    db.query(
        `UPDATE books_record SET copies = ${db.escape(copies)} WHERE bookId = ${db.escape(bookId)}`,
    );
    res.redirect("/admin");
});

app.get("/checkout/" ,(req, res) => {

    res.render("views/reqCheckout");
    
    // res.sendFile(__dirname + "/public/screens/register.html");
});
app.post("/checkout", validateCookies ,  (req, res) => {
    // console.log(req);
    let reqId = req.body.reqId;
    db.query(
        `SELECT * FROM requests WHERE reqId = ${db.escape(reqId)}`,
            (err,row)=>{ var bookID = row[0].bookId ;
    let userId = req.userID;
    db.query(
        `INSERT INTO requests (bookId, userId , status) VALUES(${db.escape(bookID)},${db.escape(userId)} , -1 );`
    );});
    res.redirect("/");

});


app.get("/checkin/" ,(req, res) => {

    res.render("views/reqcheckin");
    
    // res.sendFile(__dirname + "/public/screens/register.html");
});

app.post("/checkin",validateCookies,  (req, res) => {
    // console.log(req);
    let reqId = req.body.reqId;
    db.query(
        `SELECT * FROM requests WHERE reqId = ${db.escape(reqId)}`,
            (err,row)=>{ var bookID = row[0].bookId ;
    let userId = req.userID;
    db.query(
        `UPDATE requests SET status = 1 WHERE bookId = ${db.escape(bookID)}`
    );});
    res.redirect("/");
});

app.get("/admin/checkout/" ,(req, res) => {

    res.render("views/checkout");
    
    // res.sendFile(__dirname + "/public/screens/register.html");
});
app.post("/admin/checkout",  (req, res) => {
    // console.log(req);
    let reqId = req.body.reqId;
    
    
    db.query(
        `SELECT * FROM requests WHERE reqId = ${db.escape(reqId)}`,
            (err,row)=>{ var bookID = row[0].bookId ;
                db.query(
        `UPDATE requests SET status = 0 WHERE reqId = ${db.escape(reqId)}`
                ),
        db.query(
            `SELECT * FROM books_record WHERE bookId = ${db.escape(bookID)}`,
            (err,result)=>{
               
                    
                    let FinalCopies = parseInt(result[0].copies)-1;
                    db.query(
                    `UPDATE books_record SET copies = ${db.escape(FinalCopies)} WHERE bookId = ${db.escape(bookID)}`
        );
            }
        )
    }, );
    res.redirect("/");

});

app.get("/admin/checkin/" ,(req, res) => {

    res.render("views/checkin");
    
    // res.sendFile(__dirname + "/public/screens/register.html");
});
app.post("/admin/checkin",  (req, res) => {
    // console.log(req);
    let reqId = req.body.reqId;
   let bookID;
    db.query(
        `SELECT * FROM requests WHERE reqId = ${db.escape(reqId)}`,
            (err,row)=>{  bookID = row[0].bookId ;
                db.query(        
        `DELETE FROM requests WHERE reqId = ${db.escape(reqId)} `
                ),
        db.query(
            `SELECT * FROM books_record WHERE bookId = ${db.escape(bookID)}`,
            (err,result)=>{
               
                    
                    let FinalCopies = parseInt(result[0].copies)+1;
                    db.query(
                    `UPDATE books_record SET copies = ${db.escape(FinalCopies)} WHERE bookId = ${db.escape(bookID)}`
        );
            }
        )
    },);
    res.redirect("/");

});

// data = [
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 'sfdf' },
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 'sfdf' },
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 0 },
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 'sfdf' },
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 'sfdf' },
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 'sfdf' },
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 'sfdf' },
//     { bookId: 'he', bookName: 'sds', author: 'sd', copies: 'sfdf' }

// ];

// reqdata = [
//     { reqId: 'he', date: 'sds', bookId: 'asfhia', status: 'Check-In' },
//     { reqId: 'he', date: 'sds', bookId: 'asfhia', status: 'Check-In' },
//     { reqId: 'he', date: 'sds', bookId: 'asfhia', status: 'Check-In' },
//     { reqId: 'he', date: 'sds', bookId: 'asfhia', status: 'Check-In' },
//     { reqId: 'he', date: 'sds', bookId: 'asfhia', status: 'Request Check-In' },
//     { reqId: 'he', date: 'sds', bookId: 'asfhia', status: 'Request Check-In' },
//     { reqId: 'he', date: 'sds', bookId: 'asfhia', status: 'Request Check-In' }

// ];

// bookStatus{
//     1 : "Requested Check-In"
//     0: "Check-out"
//      -1: Requested- check-out
// }

app.get("/client", validateCookies, (req, res) => {

    let books = [];
    let reqBook =[];
    db.query(
        `SELECT bookId, bookName, author, copies FROM books_record`,
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                console.log(result);
                if (result == "") {
                    books = [{ bookId: 'empty', bookName: 'empty', author: 'empty', copies: 'empty' }];
                }
                else { books = [] }
                result.forEach((book) => {
                    //console.log(book.BOOKID);
                    //   console.log("no");
                    books.push({ bookId: book.bookId, bookName: book.bookName, author: book.author, copies: book.copies });
                });
                //console.log(books[0].BOOKID)
                console.log(req.userId)
                console.log("heh")
                // res.sendFile(__dirname + "/public/style/client.css");
                // res.render("views/client", { username: "Sukhman", data: books })
            }
        }
    );
    db.query(
        `SELECT * FROM requests`,
        (err , result )=>{
            if(err){throw err}
            else{
                if (result == "") {
                    console.log("result is empty");
                    reqBook = [{ reqId: 'empty', date: 'empty', bookId: 'empty', userId: 'empty' , status: "none" }];
                }
                else { reqBook = [] }
                result.forEach((book) => {
                    //console.log(book.BOOKID);
                    //   console.log("no");
                    reqBook.push({ reqId: book.reqId, date: book.date, bookId: book.bookId, userId: book.userId , status : book.status });
                });
                res.render("views/client", { username: req.userName , data: books , reqdata: reqBook })
            }
        },
        
    );

    

});

app.get("/client", validateCookies, (req, res) => {

    let books = [];
    let reqBook =[];
    db.query(
        `SELECT bookId, bookName, author, copies FROM books_record`,
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                console.log(result);
                if (result == "") {
                    books = [{ bookId: 'empty', bookName: 'empty', author: 'empty', copies: 'empty' }];
                }
                else { books = [] }
                result.forEach((book) => {
                    //console.log(book.BOOKID);
                    //   console.log("no");
                    books.push({ bookId: book.bookId, bookName: book.bookName, author: book.author, copies: book.copies });
                });
                //console.log(books[0].BOOKID)
                console.log(req.userId)
                console.log("heh")
                // res.sendFile(__dirname + "/public/style/client.css");
                // res.render("views/client", { username: "Sukhman", data: books })
            }
        }
    );
    db.query(
        `SELECT * FROM requests`,
        (err , result )=>{
            if(err){throw err}
            else{
                if (result == "") {
                    console.log("result is empty");
                    reqBook = [{ reqId: 'empty', date: 'empty', bookId: 'empty', userId: 'empty' , status: "none" }];
                }
                else { reqBook = [] }
                result.forEach((book) => {
                    //console.log(book.BOOKID);
                    //   console.log("no");
                    if(book.status == 0){var Status="Requested Check-In"} else{var Status="Check-In"}
                    reqBook.push({ reqId: book.reqId, date: book.date, bookId: book.bookId, userId: book.userId , status : Status });
                });
                res.render("views/client", { username: req.userName , data: books , reqdata: reqBook })
            }
        },
        
    );

    

});

// bookStatus{
//     1 : "Requested Check-In"
//     0: "Check-out"
//      -1: Requested- check-out
// }

app.get("/admin", (req, res) => {

    let books = [];
    let reqBook =[];
    let adminReq =[];
    db.query(
        `SELECT bookId, bookName, author, copies FROM books_record`,
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                console.log(result);
                if (result == "") {
                    books = [{ bookId: 'empty', bookName: 'empty', author: 'empty', copies: 'empty' }];
                }
                else { books = [] }
                result.forEach((book) => {
                    //console.log(book.BOOKID);
                    //   console.log("no");
                    books.push({ bookId: book.bookId, bookName: book.bookName, author: book.author, copies: book.copies });
                });
                //console.log(books[0].BOOKID)
                console.log(req.userId)
                console.log("heh")
                // res.sendFile(__dirname + "/public/style/client.css");
                // res.render("views/client", { username: "Sukhman", data: books })
            }
        }
    );
    db.query(
        `SELECT * FROM requests`,
        (err , result )=>{
            if(err){throw err}
            else{
                if (result == "") {
                    console.log("result is empty");
                    reqBook = [{ reqId: 'empty', date: 'empty', bookId: 'empty', userId: 'empty' , status: "none" }];
                }
                else { reqBook = [] }
                result.forEach((book) => {
                    //console.log(book.BOOKID);
                    //   console.log("no");
                    // if(book.status == 0){var Status="Requested Check-In"} else{var Status="Check-In"}
                    reqBook.push({ reqId: book.reqId, date: book.date, bookId: book.bookId, userId: book.userId , status : book.status });
                });
                // res.render("views/admin", { username: req.userName , data: books , reqdata: reqBook })
            }
        },
        
    );

    db.query(
        `SELECT * FROM adminReq`,
        (err , result )=>{
            if(err){throw err}
            else{
                if (result == "") {
                    console.log("result is empty");
                    adminReq = [{ reqId: 'empty', date: 'empty', userId: 'empty',  status: "none" }];
                }
                else { adminReq = [] }
                result.forEach((user) => {
                    //console.log(book.BOOKID);
                    //   console.log("no");
                    adminReq.push({ reqId: user.reqId, date: user.date, userId: user.userId , status : user.status });
                });
                res.render("views/admin", { username: req.userName , data: books , reqdata: reqBook , adminReq: adminReq })
            }
        },
        
    );

    

});


app.post("/login", async (req, res) => {
    // console.log(req);
    let username = req.body.username;
    let password = req.body.password;
    console.log(username + ' \\ ' + password);

    db.query(
        `SELECT * FROM users WHERE userName = ${db.escape(username)};`,
        (err, row) => {
            if (err) {
                // throw err
                console.log("nothing here")
                // res.sendFile(__dirname + "/public/screens/register.html");
                res.render("views/index", { data: "Incorrect ID or Password" });
                // res.render('/', { data: "Incorrect ID or Password" });
            }
            else {
                authenticate(res, username, password, row);
            }
        }
    )
});

async function checkAdminList(){
    let admin = false;
    db.query(`SELECT admin FROM users`,(err , results)=>{ 
        
        if (err) {
        console.error(err);
      }
    //   console.log(results);
      results.forEach((result) => {
        console.log(result.admin);
        if(result.admin == 1 ){
            admin = true ;
            
        }
    });
    return admin;
    });
}

app.post("/register", async function (req, res) {

    let username = req.body.username;
    let password = req.body.password;
    let reqAccess = req.body.adminAccess;
    console.log(username + ' \\ ' + password + 'and ' + reqAccess)
    var pass = await hashPassword(password);
    db.query(
        "SELECT salt,hash,id, admin,userName from users where userName = " + db.escape(username) + ";",
        async (err, result, field) => {
            if (err) {
                throw err
            }
            else {


                if (result[0] === undefined) {

                    
                    console.log("trying to access database ....")
                    // console.log(pass)
                    let admin = false;

                    if(reqAccess != undefined)
                    {
                    admin = await checkAdminList();
                    
                       
                    // If no one is admin till date
                    if(admin == false){
                        console.log("no Admin")
                        db.query(
                        `INSERT INTO users (userName, hash, salt, admin) VALUES(${db.escape(username)},'${pass.hash}','${pass.salt}', 1);`
                    );}

                    // If someone is Admin (Who will decide for your request)
                    else{
                        console.log("these is a admin ");
                        let userID =0;
                        
                                db.query(
                                    `INSERT INTO users (userName, hash, salt, admin) VALUES(${db.escape(username)},'${pass.hash}','${pass.salt}', 0);`
                                );
                                db.query(
                                    "SELECT id from users where userName = " + db.escape(username) + ";",
                                    (err, result1, field) => {
                                        if (err) {
                                            throw err
                                        }
                                        else { userID = result1[0].id ; console.log(userID)
                                        db.query(
                                            `INSERT INTO adminReq ( userId, status) VALUES(${userID}, 0);`
                                        );}
                                    });
                                        
                               
                            }}
                    else{
                        db.query(
                            `INSERT INTO users (userName, hash, salt, admin) VALUES(${db.escape(username)},'${pass.hash}','${pass.salt}', 0);`
                        );
                    }
                    console.log("done")
                    // console.log(result[0].id)
                    res.render("views/index", { data: "heh" });
                    // res.sendFile(__dirname + "/public/screens/index.html");
                    // res.render("");

                } else {
                    // res.send("Username is not unique");
                    res.render("views/register", { data: "Username is not unique" });
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
