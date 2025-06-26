// ? Some important comments may be in routes directory

const Campground = require("../models/campground");
const Review = require("../models/review");

// # Create Review
module.exports.createReview = async (req, res) => {
    const cg = await Campground.findById(req.params.id); // Find the campground in the database using the ID from the route parameter

    const review = new Review(req.body.review); // Create a new Review instance using the review data sent in the request body

    review.author = req.user._id;

    cg.reviews.push(review); // Add the newly created review to the campground's reviews array

    await review.save(); // Save the review document to the database
    await cg.save(); // Save the updated campground document to the database (with the review reference added)

    req.flash("success", "Successfully posted your review :)"); // flash message

    res.redirect(`/campgrounds/${cg._id}`); // Redirect the user to the show page for the campground
};

// # Delete Review
module.exports.deleteReview = async (req, res) => {
    const { id, revID } = req.params; // Destructure the campground ID (`id`) and review ID (`revID`) from the request parameters.

    await Campground.findByIdAndUpdate(
        id, // Find the campground by its ID.
        { $pull: { reviews: revID } } // Use `$pull` to remove the reference to the review ID from the `reviews` array in the campground document.
        // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    );

    await Review.findByIdAndDelete(revID); // Find and delete the review document by its ID from the `Review` collection.

    req.flash("success", "Successfully deleted the review :)"); // flash

    res.redirect(`/campgrounds/${id}`); // Redirect back to the specific campground's page after successfully deleting the review.
};
