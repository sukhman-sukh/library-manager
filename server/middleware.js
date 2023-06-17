const db = require("../database");

//Creating Middleware
exports.validateCookies = function (req, res, next) {
    req.adminAuth = 0;
    try {
        var cookieId = req.headers.cookie.slice(10);
    }
    catch (err) {
        res.redirect("/");
    }  
    if (req.headers.cookie.includes("sessionID")) {
        db.query(
            `SELECT cookie.sessionId, cookie.userId, users.admin , users.userName FROM cookie, users WHERE sessionId = ${db.escape(cookieId)} AND users.id = cookie.userId;`,
            (err, result) => {

                console.table(result);
                if (err) {
                    throw err;
                }
                else {
                    if (result[0].admin === 1) {
                        req.adminAuth = 1;
                    }
                    else {
                        req.adminAuth = 0;
                    }

                    if (cookieId == result[0].sessionId) {
                        req.userID = result[0].userId;
                        req.userName = result[0].userName;
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

exports.isAdmin = function (req, res, next) {
    if (req.adminAuth === 1) {
        next();
    }
    else {
        res.status(403).send({ 'msg': 'Not Authenticated' });
    }
}