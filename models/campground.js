const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema; // just for abbreviation

// this schema is just to be used over here in this file and not to be exported
const ImageSchema = new Schema({
    url: String, // from cloudinary
    filename: String, // from cloudinary (images will not be saved with the name that user images had while uploading from pc)
});

// is actually not stored, will just look to us as if it is stored, but actually it will always be calculated from the url
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200"); //will give smaller image (feature of cloudinary)
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    reviews: [
        // comment0
        {
            type: Schema.Types.ObjectId,
            ref: "Review", // Review model is the reference
        },
    ],
});

// # Mongoose middleware for deleting all the associated reviews if a campground is deleted.
// comment1
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    // Add a post middleware to the Campground schema to execute after a campground is deleted
    // Check if a document (campground) was successfully deleted
    if (doc) {
        // Use the Review model to delete all reviews whose IDs are referenced in the deleted campground's 'reviews' array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews, // Match the IDs in the 'reviews' array of the deleted campground to delete the corresponding review documents
            },
        });
    }
});

//! comment3
module.exports = mongoose.model("Campground", CampgroundSchema); // export this, so that we can 'require' this in other files.
//                          singular & capitalised

/*
note : comment 0
    - A one to many relation with the 'Review'-Model
    - Out of the 3 one to many relation types, we go with the middle (one to many) type
    - In this type we store the data separately, but then store references to document ID's somewhere inside the parent in an array.
    - This is selected coz we wanna access reiew from the campground, not campground from review.
*/

/*
note : comment 1
    ? Key things to understand:
    * Why We Need This Middleware:
        - Without this middleware, deleting a campground would leave its reviews in the database. These reviews would never be accessed or displayed since they are only linked to the deleted campground, making them orphaned records.
        - Removing orphaned reviews ensures the database remains clean and free of unused data.

    * Why findOneAndDelete Middleware is Used:
        - In app.js, we use findByIdAndDelete() to delete campgrounds.
        - The findByIdAndDelete() method internally triggers Mongoose's findOneAndDelete middleware.
        - Since our middleware is tied to findOneAndDelete, it automatically runs whenever a campground is deleted using findByIdAndDelete().
        - If we used a different Mongoose delete method (e.g., remove or deleteMany), we would need to explicitly define middleware corresponding to those methods.
        - Only findOneAndDelete triggers this middleware; other methods do not.

    * Post Middleware Behavior:
        - In post middleware, the deleted document is passed as doc. This is why the middleware can access the reviews array from the deleted campground.
        - If this were a "pre" middleware, the campground would still exist in the database, but the final deleted document would not be accessible.

    ? Practical Flow:
    - User deletes a campground using findByIdAndDelete.
    - The post("findOneAndDelete") middleware is triggered.
    - The middleware checks if the deletion was successful by verifying if doc exists.
    - If successful, the middleware deletes all reviews referenced in the deleted campground's reviews array.
    - The database is left clean with no orphaned reviews.
*/

/*
note : comment3
- Ensure this line comes at the end of the file.
- If you define module.exports before completing all related code (e.g., adding methods or middleware to CampgroundSchema),
- those changes might not be included in the exported module.
- This is because module.exports locks in the export at the point where it's declared.
*/

/*
note:  Explanation
    * Schema Definition:
    The CampgroundSchema defines the structure of the documents you will store in the MongoDB campgrounds collection. It specifies the fields (title, price, description, location) and their data types.
    The schema acts as a blueprint for your data but does not store any data itself.
    
    * Model Creation:
    mongoose.model("Campground", CampgroundSchema) creates a model based on the schema. This model is used to interact with the database (e.g., creating, reading, updating, and deleting data).
    
    * Data Storage:
    To store data in the database, you create a new instance of the model with the data you want to save, then call .save() to persist it to the MongoDB collection.
*/

/* 
note : Module-name (Campgrounds) and Collection-name (campgrounds)

    ? collection name is derived from model name
        module.exports = mongoose.model("Review", reviewSchema);

        Mongoose automatically converts the model name (Review) into a collection name by:
        1. Lowercasing the model name.
        2. Pluralizing it to match MongoDB's collection naming conventions.
        So, in this case:

        eg : Review → reviews (the collection name in MongoDB).

        * custom collection name
        module.exports = mongoose.model("Review", reviewSchema, "customCollectionName");
        * get all collections in a database
        db.getCollectionNames();

    ? Model Name
        The model name is what you use in your application code to interact with the database. It is defined when you create a Mongoose model:
        const Review = mongoose.model("Review", reviewSchema);
        
        * Purpose: (for developers)
        - It provides methods like .find(), .save(), .updateOne(), etc., to perform CRUD (Create, Read, Update, Delete) operations on the associated collection.

    ? Collection Name
        The collection name refers to the actual collection in MongoDB where the data is stored. When you use the model name (Review), Mongoose maps it to the collection name (reviews by default, unless you specify a custom one).

        * Purpose: (for mongodb)
        - It is where your application data is physically stored in MongoDB.
        - You can query this collection directly via MongoDB commands or indirectly via the Mongoose model.
    
    ? How They Work Together
        The model name is for developers. You use it in your application code.
        The collection name is for MongoDB. It's where your documents are stored.
        Example Workflow:

        *You create a model:
            const Review = mongoose.model("Review", reviewSchema);

        - Mongoose automatically maps this to the reviews collection in MongoDB.
        - When you perform an operation using Review, like:

            const allReviews = await Review.find();

        - Mongoose queries the 'reviews' collection in the database to fetch the data.
*/
