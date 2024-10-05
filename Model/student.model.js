const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { object, boolean } = require("yup");

const studentschema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  courses: [
    {
      courseId: String,
      courseTitle: String,
      paid: Boolean,
      certified: Boolean,
    },
  ],
  certificates: [{ type: Object, trim: true }],
});

const stdloginschema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true, trim: true },
});

const videoProgressSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  watched: { type: Boolean, default: false },
  watchedAt: { type: Date, default: Date.now },
});

const courseProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  progress: [videoProgressSchema],
});

let saltRound = 10;
studentschema.pre("save", function (next) {
  console.log(this.password);
  bcrypt
    .hash(this.password, saltRound)
    .then((hashpassword) => {
      this.password = hashpassword;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

const courseProgress = mongoose.model("course_progress", courseProgressSchema);
const studentmodel = mongoose.model("student_collection", studentschema);
const studentlogmodel = mongoose.model("studentlog_collection", stdloginschema);
module.exports = { studentmodel, studentlogmodel, courseProgress };
