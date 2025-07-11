// We will run this file when we would want to seed our data

const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campground"); // currently we are is seeds dir '..' is to exit out of that dir, then we are in main dir, from there we goto models and then campground
const { descriptors, places } = require("./seedHelpers"); // we are using destructuring here.

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database is connected :)");
});

// function to create a sample title from seedHelpers.js
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]; // will return a random value from the passed array.

// defining the seedDB function
const seedDB = async () => {
    try {
        await Campground.deleteMany({}); //! Delete all existing campgrounds

        // seeding the db with 'count' campgrounds
        const count = 10;

        for (let index = 0; index < count; index++) {
            const random20 = Math.floor(Math.random() * 20); // 0 to 19

            const camp = new Campground({
                author: "67d188feea2619f2ce80db9f",
                location: `${cities[random20].city}, ${cities[random20].state}`,
                title: `${sample(descriptors)} ${sample(places)}`,
                images: [
                    {
                        url: "https://res.cloudinary.com/dsun79dgf/image/upload/v1744656421/YelpCamp/ax5lfko0ftratmtkhrrc.jpg",
                        filename: "YelpCamp/g05x9hnr1vdp11vn9jpn",
                    },
                    {
                        url: "https://res.cloudinary.com/dsun79dgf/image/upload/v1744680498/YelpCamp/dvoe5dafr0vbwc2wh66w.jpg",
                        filename: "YelpCamp/dvoe5dafr0vbwc2wh66w",
                    },
                    {
                        url: "https://res.cloudinary.com/dsun79dgf/image/upload/v1744680103/YelpCamp/g05x9hnr1vdp11vn9jpn.jpg",
                        filename: "YelpCamp/dvoe5dafr0vbwc2wh66w",
                    },
                    {
                        url: "https://res.cloudinary.com/dsun79dgf/image/upload/v1744680078/YelpCamp/ncbac3s2yfccomxrri5p.jpg",
                        filename: "YelpCamp/dvoe5dafr0vbwc2wh66w",
                    },
                    {
                        url: "https://res.cloudinary.com/dsun79dgf/image/upload/v1744680265/YelpCamp/gu2p3czbjh9fcge5eq9y.jpg",
                        filename: "YelpCamp/dvoe5dafr0vbwc2wh66w",
                    },
                    {
                        url: "https://res.cloudinary.com/dsun79dgf/image/upload/v1744680934/YelpCamp/zot8g9xbm8xvvfz4euzs.jpg",
                        filename: "YelpCamp/dvoe5dafr0vbwc2wh66w",
                    },
                    {
                        url: "https://res.cloudinary.com/dsun79dgf/image/upload/v1744680891/YelpCamp/ii2cosvvnnqutykzrdxf.jpg",
                        filename: "YelpCamp/dvoe5dafr0vbwc2wh66w",
                    },
                ],
                description:
                    "This is a sample description. This is a sample description. This is a sample description. This is a sample description. This is a sample description.",
                price: Math.floor(Math.random() * 100) + 10,
            });
            await camp.save();
        }

        console.log(`Database seeded with ${count} campground(s).`);
    } catch (err) {
        console.error("Error seeding the database:\n", err);
    }
};
/* Can also describe like : (abhi 'this' keyword ko use nahi kar rahe hain so => and 'function' both behave similarly)
    async function seedDB(){}
*/

// now call the seed function
// since seedDB is an async function, it will return a promise
seedDB().then(() => {
    mongoose.connection.close();
});
