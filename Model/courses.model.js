const mongoose = require("mongoose");
const { string } = require("yup");

const courseschema = new mongoose.Schema({
    video_title:{type: String, required: true, unique: true},
    sub_title: { type: String, required: true, trim: true },
    video_url: [{ type: String }],
    title: {type: String, required: true, unique: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    authors_name: {type: String, required: true, trim: true },
    language: {type: String, required:true, trim: true},
    learn: [{ type: String }],
    requirements: [{ type: String }],
    description:{type: String},
    price:{ type: Number, required:true}

    
  });





  const coursemodel = mongoose.model("course_collection", courseschema);
module.exports = {coursemodel}