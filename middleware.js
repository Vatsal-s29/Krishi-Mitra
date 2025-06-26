// created separate file coz we want to use it in campgrounds as well as reviews

const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

// (note in lec: 533) This is needed coz of updates in Passport : the session now gets cleared after a successful login. This causes a problem with our returnTo redirect logic because we store the returnTo route path (i.e., the path where the user should be redirected back after login) in the session (req.session.returnTo)
// By using the storeReturnTo middleware function, we can save the returnTo value to res.locals before passport.authenticate() clears the session and deletes req.session.returnTo. This enables us to access and use the returnTo value (via res.locals.returnTo) later in the middleware chain so that we can redirect users to the appropriate page after they have logged in.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isLoggedIn = (req, res, next) => {
    // without passport, we would have stored userid in session (if user logged in) and if the user is not,they will not be allowed to do some specific tasks.
    if (!req.isAuthenticated()) {
        // we have added this 'returnTo' item to the session obj
        req.session.returnTo = req.originalUrl; // storing where we were trying to go before we were redirected to login to continue that action

        req.flash("error", "You need to be signed in to perform this action");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateCampground = (req, res, next) => {
    // schema (campgroundSchema) transfered to schemas.js

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // 'error.details' is actually an array of messages
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;

    // part to check whether the currentUser is the author of the camp
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permissio to do that !!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, revID } = req.params; // ! note 3

    // part to check whether the currentUser is the author of the camp
    const review = await Review.findById(revID);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permissio to do that !!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    // schema (reviewSchema) transfered to schemas.js

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // 'error.details' is actually an array of messages
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// note : exporting proper ways :
//    ?Exporting the function directly: (returns isLoggedIn function)
//    module.exports = isLoggedIn;
//    *Import it like this :
//    const isLoggedIn = require("../middleware");

//    ?Exporting it as a property of an object:** (returns an object with isLoggedIn property)
//    module.exports.isLoggedIn = isLoggedIn;
//    *Import it like this:
//    const { isLoggedIn } = require("../middleware");

// note : req.user
// When a user logs in using Passport, it serializes the user information (typically a user ID) into the session. On subsequent requests, Passport automatically deserializes the user and attaches the user object to req.user.

// note-3 : revID, id (Destructuring)
// in the path , we specified 'id' and 'revID' (/campgrounds/id/review/revID)
// now, since we have specified these names, while destructuring we have to use these names only.
// THINGS BROKE DOWN when i used 'reviewId', instead of 'revID'
//  ? While defining middleware, see what path you have made and destructure accordingly only.