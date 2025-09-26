const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("MongoDB Connection Successful");
}).catch((err) => {
  console.log(err);
});

const User = require("./models/User");
const Exercise = require("./models/Exercise");

app.use(express.urlencoded({
  limit: '10mb',
  extended: true
}));

app.post("/api/users", async (req, res) => {
  try {
    const userName = req.body.username;
    const userObj = await User.findOne({ username: userName });
    if (userObj) return res.json({ error: "User with the given username already exists" });

    const user = await new User({
      username: userName,
    }).save();

    res.json(user);
  }
  catch (error) {
    return res.json({ error: error.message });
  }
});

app.post("/api/userID", async (req, res) => {
  try {
    const userName = req.body.username;
    const userObj = await User.findOne({ username: userName });
    if (userObj) return res.json(userObj);
    res.json({ error: `No ID found for ${userName}` })
  }
  catch (error) {
    return res.json({ error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const user = await User.find().select("-__v");
    res.json(user);
  }
  catch (error) {
    return res.json({ error: error.message });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const id = req.params._id;
    const user = await User.findById(id);
    if (!user) return res.json({ error: "User of the given 'id' doesn't exists" });

    const { description, duration, date } = req.body;

    if (!description) return res.json({ error: "Please provide Exercise description to proceed" });
    if (!duration) return res.json({ error: "Please provide Exercise duration to proceed" });

    const exercise = await new Exercise({
      user_id: user._id,
      description: description,
      duration: duration,
      date: date ? new Date(date) : new Date(),
    }).save();

    res.json({
      _id: user.id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
    });
  }
  catch (error) {
    return res.json({ error: "Error adding Exercise... Try agian after some time" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;

  const user = await User.findById(id);
  if (!user) return res.json({ error: "User of the given 'id' doesn't exists" });

  let dateObj = {};
  if (from) {
    dateObj["$gte"] = new Date(from);
  }
  if (to) {
    dateObj["$lte"] = new Date(to);
  }
  let filter = {
    user_id: id,
  }
  if (from || to) filter.date = dateObj;

  const exercise = await Exercise.find({ user_id: id }).limit(+limit ?? 500);
  if (!exercise) return res.json({ error: "No exercise exists for the given 'id'" });
  const log = exercise.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString(),
  }))

  res.json({
    username: user.username,
    count: exercise.length,
    _id: exercise.user_id,
    log
  });
})

const listener = app.listen(process.env.PORT || 3004, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
