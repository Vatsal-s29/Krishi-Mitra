const User = require("../models/user");

// # rendering the register form
module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

// # Registering the user
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        // if someone registers, they will aloso log in automatically (functionality by passport)
        req.login(registeredUser, (err) => {
            if (err) return next(err); // redirecting to default error handler in case of err
            req.flash("success", "Welcome to YelpCamp!!!");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
};

// # rendering the login form
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

// # login functionality add on
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back !!");

    // After loging in, redirecting back to the place where we were initially trying to go before being redirected to login page.
    const redirectUrl = res.locals.returnTo || "/campgrounds"; // ('/campgrounds' in case we directly clicked login)
    // delete res.locals.returnTo; // leave no remenants behind. (not working even if i use this line, i guess)
    res.redirect(redirectUrl);
};
// ? The actual login is done via passport in routes

// # logout
module.exports.logout = (req, res, next) => {
    // thanks to passport, our req has a logout method.
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
};
