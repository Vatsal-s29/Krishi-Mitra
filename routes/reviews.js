const express = require("express");
const router = express.Router({ mergeParams: true });
// Use { mergeParams: true } to make parameters from the parent router (e.g., :id in '/campgrounds/:id/reviews')
// accessible in the child router. Without this, req.params.id would be undefined in the child routes.

const Campground = require("../models/campground");
const Review = require("../models/review");

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// Controller
const reviews = require("../controllers/reviews");

// ? Validate review middleware
// moved to middleware.js

// # Adding Review to campground
// * we can use router.route but since each path has only one methdo here, no need to do it.

router.post(
    "/", // Define a POST route to handle review submission for a specific campground by its ID
    isLoggedIn, // post a review only if you are loged in
    validateReview, // first validate the review and then proceed.
    catchAsync(reviews.createReview)
);

// # Deleting the reviews
// * we can use router.route but since each path has only one methdo here, no need to do it.

router.delete(
    "/:revID", // Define a route to delete a specific review from a specific campground.
    isLoggedIn, // post a review only if you are loged in
    isReviewAuthor, // review author only is allowed to delete
    catchAsync(reviews.deleteReview)
);

module.exports = router;

// # Comments gyaan

// note : express router.route
// we have been using express routers which give us a functionality of using chaining to serve different methods onto the same path

/*
    note : comment0
    ? Avoid '*' error : 
        Replace :
    app.all('*', (req, res, next) => {
        With :
    app.all(/(.*)/, (req, res, next) => {
*/

/*
    note : comment1
    ? Situations when we use await :
    * 1: (Mandaory condition for await)
    await can only be used with a function that returns a Promise. It pauses the execution of the async function until the Promise resolves or rejects.
    * 2:
    In an async function, if you need to wait for one operation to complete before proceeding to the next, you use await. This ensures the steps execute in order.
    * eg:
    await is used with functions like save, find, or similar when working with asynchronous database operations.
*/

/*
    note : Comment2
    ? Explanation of ...req.body.campground
    * req.body:
        {
        "campground": {
            "title": "New Campground",
            "location": "California"
        }
        }

    * req.body.campground:
        {
        "title": "New Campground",
        "location": "California"
        }
    
    *...req.body.campground:
    The spread operator (...) takes the properties of the campground object and "spreads" them into a new object.
        {...req.body.campground}
        ? is equivalent to:
        {
        title: req.body.campground.title,
        location: req.body.campground.location
        }

    this : const cg = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    could have simply been this : const cg = await Campground.findByIdAndUpdate(id, req.body.campground);
    unless we want to do something like this : const cg = await Campground.findByIdAndUpdate(id, { ...req.body.campground, updatedAt: Date.now() });

*/

/*
    note: comment3
    ? if (!req.body.campground) {
        throw new ExpressError("Invalid Campground Data", 400);
        }
        - we have already added client side validations on html form itself. (but we have not yet added error handler to mongoose)
        - so this error will be triggered if someone sends the bad request from postman or something or any script.
        - However, this condition will not be triggered if the `campground` object exists in the request body
        - but contains incomplete or invalid data (e.g., missing fields or unexpected values or key-value paris unrelated to our context).
        - requires additional validation, such as Mongoose validation
*/
