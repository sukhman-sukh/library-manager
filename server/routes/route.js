const express = require("express");
const router = express.Router();
const logincontroller = require("../controllers/loginController");
const middleware = require("../middleware");
const bookcontroller = require("../controllers/bookController");

// Defining routes
router.get("/", logincontroller.base);
router.post("/", logincontroller.base);

router.get("/login", logincontroller.login);
router.post("/login", logincontroller.loginSubmit);

router.get("/register", logincontroller.registerPage);
router.post("/register", logincontroller.register);

router.get("/logout", middleware.validateCookies,logincontroller.logout);


router.get("/admin/checkin/", middleware.isAdmin ,bookcontroller.adminCheckin);
router.post("/admin/checkin", middleware.isAdmin ,bookcontroller.adminCheckinSubmit);

router.get("/admin/add",bookcontroller.adminAdd);
router.post("/admin/add",middleware.validateCookies ,  middleware.isAdmin ,bookcontroller.adminAddSubmit);

router.get("/admin/choose/",bookcontroller.adminChoose);
router.post("/admin/choose/accept", middleware.validateCookies,bookcontroller.adminAccept);
router.post("/admin/choose/deny", middleware.validateCookies,bookcontroller.adminDeny);

router.get("/admin/remove/",bookcontroller.adminRemove);
router.post("/admin/remove", middleware.validateCookies ,bookcontroller.adminRemoveSubmit);

router.get("/checkout/",bookcontroller.checkout);
router.post("/checkout", middleware.validateCookies ,bookcontroller.checkoutSubmit);

router.get("/checkin/",bookcontroller.checkin);
router.post("/checkin", middleware.validateCookies ,bookcontroller.checkinSubmit);


router.get("/admin/checkout/",bookcontroller.adminCheckout);
router.post("/admin/checkout" ,bookcontroller.adminCheckoutSubmit);

router.get("/admin",middleware.validateCookies , middleware.isAdmin,bookcontroller.getAdmin);

router.get("/client", middleware.validateCookies,bookcontroller.getClient);

module.exports = router;
