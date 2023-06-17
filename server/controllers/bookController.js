const express = require('express');
const db = require("../../database");

require("dotenv").config();

exports.adminAdd = (req, res) => {
    console.log("inside add")
    res.render("views/addBooks", { data: "Incorrect ID or Password" });
}


exports.adminAddSubmit = (req, res) => {

    let bookname = req.body.bookname;
    let Author = req.body.Author;
    let Copies = req.body.Copies;

    db.query(
        `SELECT * FROM books_record WHERE bookName = ${db.escape(bookname)}`,
        (err, result) => {
            if (result[0] == undefined) {
                db.query(
                    `INSERT INTO books_record (bookName, author, copies) VALUES(${db.escape(bookname)},${db.escape(Author)} ,${db.escape(Copies)} );`
                );
            }
            else {
                let FinalCopies = parseInt(Copies) + parseInt(result[0].copies)
                db.query(
                    `UPDATE books_record SET copies = ${db.escape(FinalCopies)} WHERE bookName = ${db.escape(bookname)}`
                );
            }
        }
    )

    res.redirect("/admin");
}


exports.adminChoose = (req, res) => {
    res.render("views/choose");
}

exports.adminAccept = (req, res) => {
    let reqId = req.body.reqId;
    db.query(
        `SELECT * FROM adminReq WHERE reqId = ${db.escape(reqId)}`,
        (err, result) => {
            userId = result[0].userId;

            db.query(
                `UPDATE users SET admin = 1 WHERE id = ${db.escape(userId)}`
            );
            db.query(
                `DELETE FROM adminReq WHERE reqId = ${db.escape(reqId)};`
            );
        });
    res.redirect("/admin");
};


exports.adminDeny = (req, res) => {

    let reqId = req.body.reqId;
    db.query(
        `DELETE FROM adminReq WHERE reqId = ${db.escape(reqId)};`
    );
    res.redirect("/admin");
}


exports.adminRemove = (req, res) => {

    res.render("views/removeBooks");
}

exports.adminRemoveSubmit = (req, res) => {

    let bookId = req.body.bookId;
    let copies = req.body.Copies;
    db.query(
        `UPDATE books_record SET copies = ${db.escape(copies)} WHERE bookId = ${db.escape(bookId)}`,
    );
    res.redirect("/admin");
};

exports.checkout = (req, res) => {
    res.render("views/reqCheckout");
}

exports.checkoutSubmit = (req, res) => {

    let bookId = req.body.bookId;

    let userId = req.userID;
    db.query(
        `INSERT INTO requests (bookId, userId , status) VALUES(${db.escape(bookId)},${db.escape(userId)} , -1 );`
    );
    res.redirect("/");

}

exports.checkin = (req, res) => {
    res.render("views/reqcheckin");
}

exports.checkinSubmit = (req, res) => {

    let reqId = req.body.reqId;
    db.query(
        `SELECT * FROM requests WHERE reqId = ${db.escape(reqId)}`,
        (err, row) => {
            var bookID = row[0].bookId;
            db.query(
                `UPDATE requests SET status = 1 WHERE bookId = ${db.escape(bookID)}`
            );
        });
    res.redirect("/");
};

exports.adminCheckout = (req, res) => {

    res.render("views/checkout");
}

exports.adminCheckoutSubmit = (req, res) => {
    let reqId = req.body.reqId;


    db.query(
        `SELECT * FROM requests WHERE reqId = ${db.escape(reqId)}`,
        (err, row) => {
            var bookID = row[0].bookId;
            db.query(
                `UPDATE requests SET status = 0 WHERE reqId = ${db.escape(reqId)}`
            ),
                db.query(
                    `SELECT * FROM books_record WHERE bookId = ${db.escape(bookID)}`,
                    (err, result) => {


                        let FinalCopies = parseInt(result[0].copies) - 1;
                        db.query(
                            `UPDATE books_record SET copies = ${db.escape(FinalCopies)} WHERE bookId = ${db.escape(bookID)}`
                        );
                    }
                )
        },);
    res.redirect("/");

}

exports.adminCheckin = (req, res) => {

    res.render("views/checkin");

}

exports.adminCheckinSubmit = (req, res) => {
    let reqId = req.body.reqId;
    let bookID;
    db.query(
        `SELECT * FROM requests WHERE reqId = ${db.escape(reqId)}`,
        (err, row) => {
            bookID = row[0].bookId;
            db.query(
                `DELETE FROM requests WHERE reqId = ${db.escape(reqId)} `
            ),
                db.query(
                    `SELECT * FROM books_record WHERE bookId = ${db.escape(bookID)}`,
                    (err, result) => {


                        let FinalCopies = parseInt(result[0].copies) + 1;
                        db.query(
                            `UPDATE books_record SET copies = ${db.escape(FinalCopies)} WHERE bookId = ${db.escape(bookID)}`
                        );
                    }
                )
        },);
    res.redirect("/");

}

// Format

// bookStatus{
//     1 : "Requested Check-In"
//     0: "Check-out"
//      -1: Requested- check-out
// }

exports.getClient = (req, res) => {

    let books = [];
    let reqBook = [];
    let userId = req.userID;
    db.query(
        `SELECT bookId, bookName, author, copies FROM books_record`,
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                if (result == "") {
                    books = [{ bookId: 'empty', bookName: 'empty', author: 'empty', copies: 'empty' }];
                }
                else { books = [] }
                result.forEach((book) => {
                    books.push({ bookId: book.bookId, bookName: book.bookName, author: book.author, copies: book.copies });
                });
            }
        }
    );
    db.query(
        `SELECT * FROM requests`,
        (err, result) => {
            if (err) { throw err }
            else {

                reqBook = []
                result.forEach((book) => {
                    if (book.userId == userId) {
                        reqBook.push({ reqId: book.reqId, date: book.date, bookId: book.bookId, userId: book.userId, status: book.status });
                    }
                });
                if (reqBook == "") {
                    reqBook = [{ reqId: 'empty', date: 'empty', bookId: 'empty', userId: 'empty', status: "none" }];
                }
                res.render("views/client", { username: req.userName, data: books, reqdata: reqBook })
            }
        },

    );



}

// bookStatus{
//     1 : "Requested Check-In"
//     0: "Check-out"
//      -1: Requested- check-out
// }

exports.getAdmin = (req, res) => {

    let books = [];
    let reqBook = [];
    let adminReq = [];
    db.query(
        `SELECT bookId, bookName, author, copies FROM books_record`,
        (err, result, field) => {
            if (err) {
                throw err
            }
            else {
                if (result == "") {
                    books = [{ bookId: 'empty', bookName: 'empty', author: 'empty', copies: 'empty' }];
                }
                else { books = [] }
                result.forEach((book) => {
                    books.push({ bookId: book.bookId, bookName: book.bookName, author: book.author, copies: book.copies });
                });
            }
        }
    );
    db.query(
        `SELECT * FROM requests`,
        (err, result) => {
            if (err) { throw err }
            else {
                if (result == "") {
                    reqBook = [{ reqId: 'empty', date: 'empty', bookId: 'empty', userId: 'empty', status: "none" }];
                }
                else { reqBook = [] }
                result.forEach((book) => {
                    reqBook.push({ reqId: book.reqId, date: book.date, bookId: book.bookId, userId: book.userId, status: book.status });
                });
            }
        },

    );

    db.query(
        `SELECT * FROM adminReq`,
        (err, result) => {
            if (err) { throw err }
            else {
                if (result == "") {
                    adminReq = [{ reqId: 'empty', date: 'empty', userId: 'empty', status: "none" }];
                }
                else { adminReq = [] }
                result.forEach((user) => {
                    adminReq.push({ reqId: user.reqId, date: user.date, userId: user.userId, status: user.status });
                });
                res.render("views/admin", { username: req.userName, data: books, reqdata: reqBook, adminReq: adminReq })
            }
        },

    );



}
