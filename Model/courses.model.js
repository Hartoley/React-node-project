const mongoose = require("mongoose");
const { string } = require("yup");

const courseschema = new mongoose.Schema({
    video_title:{type: String, unique: true},
    sub_title: { type: String, trim: true },
    video_url: [{ type: String }],
    title: {type: String,  required: true, unique: true, trim: true },
    subtitle: { type: String, trim: true },
    authors_name: {type: String, trim: true },
    language: {type: String, trim: true},
    learn: [{ type: String }],
    requirements: [{ type: String }],
    description:{type: String},
    price:{ type: Number}

    
  });





  const coursemodel = mongoose.model("course_collection", courseschema);
module.exports = {coursemodel}