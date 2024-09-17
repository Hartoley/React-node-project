const mongoose = require("mongoose");
const { string } = require("yup");

const videoSchema = new mongoose.Schema({
  sub_title: { type: String, trim: true },
  url: { type: String, required: true },
  duration: { type: Number, required: false },
  students:{ type: Number, trim: true, default: 0, }
});


const courseschema = new mongoose.Schema({
    title: {type: String,  required: true, unique: true, trim: true },
    subtitle: { type: String, trim: true },  
    language: [{type: String, trim: true}],
    sub_language: [{ type: String }],
    category: [{ type: String }],
    sub_category: [{ type: String }],
    createdBy: { type: String },
    learn: [{ type: String }],
    requirements: [{ type: String }],
    description:{type: String},
    authors_name: {type: String, trim: true },
    price:{ type: Number},
    previewVideo: { type: String},
    videos: [videoSchema],
    courseCompleted: { type: Boolean, default: false },
    star:  { type: Boolean, default: false },
    subScriber: { type: Number, trim: true, default: 0, },



    
  });



const coursemodel = mongoose.model("course_collection", courseschema);
module.exports = {coursemodel}