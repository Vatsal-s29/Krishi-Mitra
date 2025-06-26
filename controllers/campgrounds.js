// ? Some important comments may be in routes directory

const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

// # Campground list rendering
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}); // * Campground is the Model.

    res.render("campgrounds/index", { campgrounds }); // res.render by default looks into the views folder.
    //          equivalent to { campgrounds : campgrounds} (left -> name that we will use in index.ejs and right -> variable)
};

// # Rendering new campground form
module.exports.renderNewForm = (req, res) => {
    //no need for async as we are just rendering a form

    res.render("campgrounds/new");
};

// # Creating new Campground
module.exports.createCampgrounds = async (req, res, next) => {
    // comment3

    // Create a new Campground instance using the data from the request body.
    const cg = new Campground(req.body.campground); //! read the comment in new.ejs
    // here it is 'campground' coz in ejs, in name we saved as campground[field_name]

    // the images that we have defined in our schema.
    cg.images = req.files.map((f) => ({ url: f.path, filename: f.filename })); // cloudinary se filename and url leke mongodb me store karwa lenge

    cg.author = req.user._id; // we know that current user is logged in, so we can save him as the author.

    await cg.save();

    console.log(cg);

    // flashing the message
    // req.flash("success", "Successfully created a new campground :)");
    req.flash("success", "Successfully created a new Market :)");

    res.redirect(`/campgrounds/${cg.id}`);
};

// # Individual campground show page
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id) // we are accessing the 'id' in '/campgrounds/:id'.
        .populate({
            path: "reviews", // for the campground, populate all reviews
            populate: { path: "author" }, // for each review, populate the author
        }) // converting the reviews array from object id array to actual info that we need
        .populate("author"); // info of author from author id (populating author of the campground)

    if (!campground) {
        // flashing this message if we cannot find the specified campground
        req.flash("error", "Cannot find this campground :("); // flash message
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { campground }); // passing the campground of that particular id.
};

// # Rendering edit campground form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const cg = await Campground.findById(id);

    if (!cg) {
        // flashing this message if we cannot find the specified campground
        req.flash("error", "Cannot find this campground :("); // flash message
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground: cg }); // we will access cg as campground in the edit.ejs file
};

// # Updating the campground
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;

    const cg = await Campground.findByIdAndUpdate(id, {
        // querying the database with same id but this time finding as well as updating
        ...req.body.campground, // comment2
    }); // this 'campground' refers to the 'name' "campground[field_name]" that we specified in edit.ejs

    imgs = req.files.map((f) => ({ url: f.path, filename: f.filename })); // similar to what we have done above in create campground
    // temp
    cg.images = imgs; // Override the existing images array with the new one
    // ? This is better (but currently not doing it) -- cg.images.push(...imgs);// we are going to push images into the array, we are not going to override the previous array of images.
    await cg.save();

    // deleting the selected images in edit.ejs
    if (req.body.deleteImages) {
        // if any images present in the delete array

        // removing form cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
            console.log(`deleted image : ${filename} from cloudinary`);
        }

        // removing it from mongo
        await cg.updateOne({
            $pull: {
                images: {
                    filename: { $in: req.body.deleteImages },
                },
            },
        });
        console.log(cg);
    }

    req.flash("success", "Successfully updated the campground :)"); // flash

    res.redirect(`/campgrounds/${cg._id}`);
};

// # Deleting the campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;

    // part to check whether the currentUser is the author of the camp
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permissio to do that !!");
        return res.redirect(`/campgrounds/${id}`);
    }

    await Campground.findByIdAndDelete(id); // Await ensures the deletion is completed before proceeding

    // req.flash("success", "Successfully deleted the campground :)"); // flash
    req.flash("success", "Successfully deleted the market :)"); // flash

    res.redirect("/campgrounds"); // Redirect to the campgrounds page
};

// # Comments

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
