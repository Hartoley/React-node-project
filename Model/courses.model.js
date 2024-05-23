const mongoose = require("mongoose");
const { string } = require("yup");

const videoSchema = new mongoose.Schema({
  sub_title: { type: String, trim: true },
  url: { type: String, required: true }
});


const courseschema = new mongoose.Schema({
    title: {type: String,  required: true, unique: true, trim: true },
    subtitle: { type: String, trim: true },
    authors_name: {type: String, trim: true },
    language: {type: String, trim: true},
    learn: [{ type: String }],
    requirements: [{ type: String }],
    description:{type: String},
    price:{ type: Number},
    videos: [videoSchema]

    
  });




const coursemodel = mongoose.model("course_collection", courseschema);
module.exports = {coursemodel}