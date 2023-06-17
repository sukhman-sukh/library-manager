const express = require('express');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../../database");
const hash = require("../hash");
require("dotenv").config();

exports.logout = (req, res) => {
    req.headers.cookie = null
    db.query(
        `DELETE FROM cookie WHERE userId = ${db.escape(req.userID)};`,
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                res.redirect("/login");
            }
        }
    )
};

exports.login = (req, res) =>{
    res.render("views/index", { data: "." });
};

exports.loginSubmit = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
   
    db.query(
        `SELECT * FROM users WHERE userName = ${db.escape(username)};`,
        (err, row) => {
            if (err) {
                res.render("views/index", { data: "Incorrect ID or Password" });
                }
            else {
                authenticate(res, username, password, row);
            }
        }
    )
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

exports.base = (req, res) =>{

    if (req.headers.cookie == undefined) {
        res.redirect("/login")
    }
    else {
        req.adminAuth = 0;

    const cookieId = req.headers.cookie.slice(10);
    if (req.headers.cookie.includes("sessionID")) {
        db.query(
            `SELECT cookie.sessionId, cookie.userId, users.admin , users.userName FROM cookie, users WHERE sessionId = ${db.escape(cookieId)} AND users.id = cookie.userId;`,
            (err, result) => {

                console.table(result);
                if (err) {
                    throw err;
                }
                else {
                    if (result[0].admin == 1) {
                        console.log("I am ADMIN")
                        req.adminAuth = 1;
                        res.redirect("/admin");
                    }
                    else {
                        req.adminAuth = 0;
                        res.redirect("/client");
                    }
                }
            }
        )
    }
    else {
        res.status(403).send({ 'msg': 'Not Authenticated' });
    }
      

    }

}


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

exports.registerPage = (req, res) => {
    res.render("views/register", { data: "Incorrect ID or Password" });
};

exports.register = async function (req, res) {

    let username = req.body.username;
    let password = req.body.password;
    let reqAccess = req.body.adminAccess;
    var pass = await hash.hashPassword(password);
    db.query(
        "SELECT salt,hash,id, admin,userName from users where userName = " + db.escape(username) + ";",
        async (err, result, field) => {
            if (err) {
                throw err
            }
            else {


                if (result[0] === undefined) {

                    let admin = false;

                    if(reqAccess != undefined)
                    {
                    admin = await checkAdminList();
                    
                       
                    // If no one is admin till date
                    if(admin == false){
                        db.query(
                        `INSERT INTO users (userName, hash, salt, admin) VALUES(${db.escape(username)},'${pass.hash}','${pass.salt}', 1);`
                    );}

                    // If someone is Admin (Who will decide for your request)
                    else{
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
                                        else { userID = result1[0].id ;                                        db.query(
                                            `INSERT INTO adminReq ( userId, status) VALUES(${userID}, 0);`
                                        );}
                                    });
                                        
                               
                            }}
                    else{
                        db.query(
                            `INSERT INTO users (userName, hash, salt, admin) VALUES(${db.escape(username)},'${pass.hash}','${pass.salt}', 0);`
                        );
                    }
                    res.render("views/index", { data: "heh" });
                    
                } else {
                    res.render("views/register", { data: "Username is not unique" });
                }
            }
        }
    );
}
