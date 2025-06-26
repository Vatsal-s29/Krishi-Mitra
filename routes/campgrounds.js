const express = require("express");
const router = express.Router();
const passport = require("passport");
// since we have retructured things, we need to adjust the paths too (to ensure they work correctly)
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// controller
const campgrounds = require("../controllers/campgrounds");

// cloudinary storage
const { storage } = require("../cloudinary"); // no need to specify index.js as node automaticaly search for index.js file

// multer for parsing (enctype="multipart/form-data"). This will enable us to parse these types of forms normally, like we used to parse the deafult urlencoded forms.
const multer = require("multer");
const upload = multer({ storage }); // destination of where the file will be stored

// this error mechanism will be triggered if someone sends req through postman as on browser, there already is a client side validation. (we are not letting submission of form is any ield is empty).
// #  Middleware
// ? Server - side validations (for campground creation and editing)
// moved to middleware.js

router
    .route("/")
    .get(catchAsync(campgrounds.index)) // * rendering campground list
    .post(
        // * creating a new campground
        isLoggedIn, // technically this will never activate as the user will not be able to post something without going to the new page where we have put this middleware. (good for protection with postman and all)
        upload.array("image"), // cloudinary and multer storage ke liye
        validateCampground, // first validate the campground and then proceed.
        catchAsync(campgrounds.createCampgrounds)
    );
// .post(upload.array("image"), (req, res) => {
//     console.log(req.body, req.files);
//     res.send("worked multer");
// });

// * new campground create form render
router.get("/new", isLoggedIn, campgrounds.renderNewForm); // using controllers
// note: campgrounds/new should be befor campgrounds/:id, otherwise 'new will be treated as an id.

router
    .route("/:id")
    .get(catchAsync(campgrounds.showCampground)) // * rendering SHOW page for a specific campground (READ)
    .put(
        // * Editing Campground (UPDATE)
        isLoggedIn, // must be logged in to make any changes
        isAuthor, // you must be the author to edit
        upload.array('image'), // selecting image files
        validateCampground, // first validate the campground and then proceed.
        catchAsync(campgrounds.updateCampground)
    ) // Comment 2
    .delete(
        // * Deleting Capmground (DELETE)
        isLoggedIn,
        isAuthor, // you must be the author to delete
        catchAsync(campgrounds.deleteCampground)
    );

// * Editing Campground (UPDATE) form rendering
router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
);

module.exports = router;

// ! Understand the flow of what part leads where and from where we go where.
// ! Read comment0

// # Comments and gyaan start here

// note : express router.route
// we have been using express routers which give us a functionality of using chaining to serve different methods onto the same path

/*
    note : comment3
    * multer
    Middlewares : upload.single('N') & upload.array('N')
    ? 'N' should be the value specified in the 'name' field of the file input in the html form.

    - req.file when using single
    - req.files when using array
*/

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
    note : MVC method
    M = Models Directory
    V = Views Directory
    C = Controllers Directory
    This helps in a cleaner and organised structure
*/
