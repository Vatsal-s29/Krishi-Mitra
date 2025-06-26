const mongoose = require("mongoose");
const { authorize } = require("passport");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId, // not sure what this actually does and means
        ref: "User", // not sure what this actually does and means
    },
});

module.exports = mongoose.model("Review", reviewSchema);

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
