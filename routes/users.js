const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware"); // lecture note:533 (passport now clears session after login and we now need to store 'returnTo' )

const users = require("../controllers/users");

// This passport thing is going to make things a lot more cleaner and simplar.

// # Registeration

router
    .route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.register));

// # Logging in

router
    .route("/login")
    .get(users.renderLogin)
    .post(
        // use the storeReturnTo middleware to save the returnTo value from session to res.locals
        storeReturnTo,
        // passport.authenticate logs the user in and clears req.session
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        // Now we can use res.locals.returnTo to redirect the user after login
        users.login
    );

// # Logging out

router.route("/logout").get(users.logout); // not the same as video due to updation in passports (done acc to prev lecture note)

module.exports = router;

// # Comments

// note : express router.route
// we have been using express routers which give us a functionality of using chaining to serve different methods onto the same path
// router.get("/login", users.renderLogin); (separate)
// router.post("/login",xyz...); (separate)
//  can be done as shown above
