const { adminvalidator } = require("../Middleware/adminvalidator");
const bcrypt = require("bcryptjs")
const upload = require('../utils/mutler')
const {coursemodel} = require ('../Model/courses.model')
const {cloudinary} =require('../utils/clodinary')




const getcourses =(req, res) =>{
    res.render("coursestemp")
  }

const updateCourse = async (req, res) => {
    try {
      const {title, language, learn, requirements, description,authors_name, price } = req.body;
      const courseExist = await coursemodel.findOne({ title: title });
      if (courseExist) {
        res.status(404).send({ message: "Course exists", status: false });
      }

      
  
      const newCourse = await coursemodel.create( {
        
        title,
        language,
        authors_name,
        learn,
        requirements,
        description,
        authors_name,
        price}
      
      )
        
     
  
      if (!newCourse) {
        res.status(404).send({ message: "error creating course", status: false });
      }
  
      res.status(200).send({ message: "Course created", status: true });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  };

  const uploadVideos = async (req, res) => {
    const { video_title, video_subtitle, video_url } = req.body;
    try {
      console.log(video_url);
      console.log(video_title);
      console.log(video_subtitle);
      const uploadedVideo = video_url;
      if (!video_url) {
        return res.status(400).json({ message: 'Please select a video to upload' });
      }
 
      const uploadResult = await cloudinary.uploader.upload(uploadedVideo.path);
  
      const videoUrl = uploadResult.secure_url;
      const course = await coursemodel.findOneAndUpdate(
        { title: video_title },
        { $push: { videos: { title: video_title, subtitle: video_subtitle, url: videoUrl } } }, 
        { new: true }
      );
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json({ message: 'Video uploaded and course updated successfully', videoUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error uploading video', error });
    } 
  };

  module.exports={getcourses, updateCourse, uploadVideos}