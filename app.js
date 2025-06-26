// this will let us access the information present in the .env file which can have secret information also are loaded into `process.env` for local development purposes.
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
} // env file is basically a key=value pair
// while going in production or when uploading to github, we will not upload the env file and people will be able to see what needs to be inputed but not our value

const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // The path module is a core module in Node.js, (no need to install explicitly)
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const Joi = require("joi"); // for server side validations (now moved to schemas.js)

// Requiring utils
const catchAsync = require("./utils/catchAsync"); // needed in routes, not needed here anymore.
const ExpressError = require("./utils/ExpressError");

// Requiring schemas
const { campgroundSchema, reviewSchema } = require("./schemas.js");

// const { title } = require("process");

// Requiring models (mongodb models)
const Campground = require("./models/campground"); // not needed here now, used in routes
const Review = require("./models/review"); // not needed here now, used in routes
const User = require("./models/user");

// Requiring the routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

// Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");

// # MongoDB Connection Part Start
// To establish connection with the MongoDB.
mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
// Error handling
db.on("error", console.error.bind(console, "connection error : "));
/*  SIMPLAR WAY :
            db.on("error", (err) => {
                console.error("Connection error:", err);
            });
    */
// Success message once the connection is open
db.once("open", () => {
    console.log("Database Connected");
});
/*
    This snippet sets up event listeners for a Mongoose database connection. The `db.on("error")` event logs any connection errors to the console, helping you debug issues during connection setup. The `db.once("open")` event triggers a callback once the connection is successfully established and logs "Database Connected" to the console, confirming that the database is ready for use. These ensure proper monitoring of the database's connection status.
    */

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views")); // ensures Express can locate view templates regardless of where the app is run from. If you start the app from another folder using the terminal, relative paths may break, but __dirname provides the absolute path to the views folder, preventing such issues.

// # app.use()s :

app.use(express.urlencoded({ extended: true })); // telling express to parse the body.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(methodOverride("_method")); // forms only support GET or POST. we can fake PUT, PATCH and DELETE using this.
// <form action="/campgrounds/<%= cg._id %>?_method=DELETE" method="POST"> (actual method = post, faked as delete)

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Loading the static parts
app.use(express.static(path.join(__dirname, "public"))); // This line configures your Express application to serve static files (like images, CSS, JavaScript, etc.) from the directory named "public".

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sessions
// ! earlier i put this whole sessions part below the routs connection part and it was not working (POSITION MATTERS)
const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        // login info and all will now last a week, (if not specified, it would be forever)
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie for security reasons
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // datenow is precise to milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FLASH
app.use(flash()); // Enables flash messages for temporary session-based storage
// uses res.locals (defined lower)

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// PASSPORT
app.use(passport.initialize());
app.use(passport.session()); // should be lower than app.use(Session)

passport.use(new LocalStrategy(User.authenticate()));
// telling passports to use the local stratergy that we have downloaded and required and for that location stratergy, the authentication method is going to be ocated on our user model and it is called 'authenticate', comming from passport-local-mongoose. (Static methods)

// added due to password-local-mongoose.
passport.serializeUser(User.serializeUser()); // how do you get a user into the session. (store it in the session)
passport.deserializeUser(User.deserializeUser()); // How do you get the user out of the session. (un-store it in the session)

// * on the password-local-mongoose docs, there a few methods given under static. Those are the ones we are using and you can visit there to see what all we can do.
// ? We have seen how to implement authentication from scratch but here we are using PASSPOST, which is extremely simple and it have added functionalities like : Sign in with gogle, facebook, github and all.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Note: This middleware must be placed before route handlers
app.use((req, res, next) => {
    // console.log("Current User:", req.user); // Debugging
    res.locals.currentUser = req.user; // this way, every template will have access to the current user in form of 'currentUser'
    // req.user is thanks to passport.

    res.locals.success = req.flash("success"); // Extracts flash messages from the session and stores them in res.locals
    res.locals.error = req.flash("error"); // Extracts flash messages from the session and stores them in res.locals
    next();
});

// On every request, the "success" flash message (if any) is automatically stored in res.locals.
// This makes it available in templates without explicitly passing it in res.render for each route.
// "locals" refers to res.locals, which is an object in Express.js that stores request-scoped variables. These variables are available throughout the request-response cycle and are automatically accessible in the template engine without needing to be explicitly passed via res.render().

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ? Defining connection to routes

app.use("/", userRoutes); // here we are not prefixing them with anything.

// Mount the `campgroundRoutes` router on the `/campgrounds` path.
app.use("/campgrounds", campgroundRoutes);
// All routes defined in the `campgrounds` router will be prefixed with `/campgrounds`.

// Mount the `reviewRoutes` router on the `/campgrounds/:id/reviews` path.
app.use("/campgrounds/:id/reviews", reviewRoutes);
// All routes defined in the `reviews` router will be prefixed with `/campgrounds/:id/routes`.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// # END OF HEADER

// # home page rendering
app.get("/", (req, res) => {
    res.render("temphome"); // no need to specifically mention 'home.ejs'
});

// app.get(
//     "/",
//     catchAsync(async (req, res) => {
//         const campgrounds = await Campground.find({}); // * Campground is the Model.

//         res.render("campgrounds/index", { campgrounds }); // res.render by default looks into the views folder.
//         //          equivalent to { campgrounds : campgrounds} (left -> name that we will use in index.ejs and right -> variable)
//     })
// );

// note :  Campgrounds Routes shifted hrom here to routes/campgrounds.js.

// note :  Reviews Routs shifted from here to routes/reviews.js

// # Any url path that does not match the above paths
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError("Page Not Found :(", 404));
});

// # Error Handler
// Synchronous function error handled by default only.
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; // 500 is the deafult value of error status

    if (!err.message) {
        err.message = "Oh no! Something went wrong :(";
    }

    res.status(statusCode).render("error", { err });
});
//*  Those errors will be handled this way that are passed inside of 'catchAsync' or 'next' somewhere above
// These include the undefined url errors as well as the catchAsync ones.
// the synchronous error that are not explicitly passed in next will be handled by default express handler
// We have manually wrapped all async errors in catchAsync.

// # listening on given port
app.listen(3000, () => {
    console.log("Servingg on port 3000");
});

// !! i am not confident about what address should i put in delete, and all.
// !! ejs wale pages and idhar se dekh ke poora samjho kaha se kya redirect wahera ho raha hai

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

/*
    note : general info
    ? PRETTY CRUCIAL
    * PRETTY CRUCIAL
        whenever we will submit the form, we will send a req of the specified 'method' of the specified url.
        corresponding to that url and method, whatever will be given in app.js will be executed.

        When we just type something in the url section of browser, by default the GET method for that url is trigered, not any other method.
        (This is because we are trying to GET the contents of that page)

        res.redirect is also just taking us to that give url (kind like GET)
*/

/*
    note : gyaan
    ? Difference Between req.params, req.body, and req.query
    * Object: req.params	
    Source: Extracted from route placeholders.	
    Example Use Case: Identifying a specific resource by its ID (/users/:id).

    * Object: req.body	
    Source: Data sent in the body of a request (e.g., via forms or JSON).	
    Example Use Case: Creating or updating a resource. Requires a body parser like express.json().

    * Object: req.query	
    Source: Extracted from query string parameters in the URL.	
    Example Use Case: Filtering or searching (/campgrounds?location=NY&price=low).
*/

/*
    note : gyaan
    ? It is expected that whatever we are putting inside of next() is an error.
    We mean that we pass something into next only when we want the error handler to be triggered.
    It is true that we only pass error inside of next, not any other middleware.
*/

/*
    note : gyaan
    ? Public directory
    The public directory in a web application is a folder used to store static assets such as images,
    stylesheets, JavaScript files, fonts, or other resources that need to be directly accessible to the client (browser).
    These files are not processed or modified by the server—they are simply served "as-is" when requested by the client.
*/

/*
    note : gyaan
    ? Session
    - not only needed for flash
    - also needed for authentication
*/
