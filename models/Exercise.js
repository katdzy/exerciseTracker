const mongoose = require("mongoose");

const ExerciseSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    description: String,
    duration: Number,
    date: Date,
});

module.exports = mongoose.model("Exercise", ExerciseSchema);