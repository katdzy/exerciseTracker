const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({ username: String });

module.exports = mongoose.model("User", UserSchema);