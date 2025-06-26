const cloudinary = require("cloudinary").v2; // copy-paste from dics of multer-storage-cloudinary
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // copy-paste from dics of multer-storage-cloudinary

// setting up the cloudinary configurations (the left names are constant and the right names are what you named them in the env file)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// setting up an instance of cloudinary storage in this file
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "YelpCamp", // folder in cloudinary in which we will store things
        allowedFormats: ["png", "jpeg", "jpg"],
    },
});

module.exports = {
    cloudinary,
    storage,
};
