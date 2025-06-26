// const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

UserSchema.plugin(passportLocalMongoose);
// this is going to add on to our schema the field for password and username.
// We have to make sure that the user names are unique, not duplicated

module.exports = mongoose.model("User", UserSchema);
