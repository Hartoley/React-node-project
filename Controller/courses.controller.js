const { adminvalidator } = require("../Middleware/adminvalidator");
const bcrypt = require("bcryptjs")
const upload = require('../utils/mutler')
const {coursemodel} = require ('../Model/courses.model')
const {cloudinary} =require('../utils/clodinary')
const fs = require('fs');



const getcourses =(req, res) =>{
    res.render("coursestemp")
  }

// const updateCourse = async (req, res) => {
//     try {
//       const {title, sub_title, language, learn, requirements, description,authors_name, price } = req.body;
//       const courseExist = await coursemodel.findOne({ title: title });
//       if (courseExist) {
//         res.status(404).send({ message: "Course exists", status: false });
//       }

//       const newCourse = await coursemodel.create( {
//         title,
//         sub_title,
//         language,
//         learn,
//         requirements,
//         description,
//         authors_name,
//         price}
      
//       )
        
     
  
//       if (!newCourse) {
//         res.status(404).send({ message: "error creating course", status: false });
//       }
  
//       res.status(200).send({ message: "Course created", status: true });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({ message: error.message });
//     }
//   };
  const updateCourse = async (req, res) => {
    try {
      const { title, sub_title, language, learn, requirements, description, authors_name, price } = req.body;
      const courseExist = await coursemodel.findOne({ title: title });
      if (courseExist) {
        return res.status(400).send({ message: "Course already exists", status: false });
      }
  
      const newCourse = await coursemodel.create({
        title,
        sub_title,
        language,
        learn,
        requirements,
        description,
        authors_name,
        price
      });
  
      if (!newCourse) {
        return res.status(500).send({ message: "Error creating course", status: false });
      }
  
      res.status(200).send({ message: "Course created", status: true, course: newCourse });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  };
  



  const uploadVideos = async (req, res) => {
    const uploadedVideo = req.file;
    const { sub_title } = req.body;
    const courseId = req.params.courseId; 
  
    try {
      if (!uploadedVideo) {
        return res.status(400).json({ message: 'Please select a video to upload' });
      }
  
      const validVideoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
      const fileExtension = uploadedVideo.originalname.split('.').pop().toLowerCase();
  
      if (!validVideoExtensions.includes(fileExtension)) {
        fs.unlinkSync(uploadedVideo.path);
        return res.status(400).json({ message: 'Invalid video file type' });
      }
  
      const uploadResult = await cloudinary.uploader.upload(uploadedVideo.path, {
        resource_type: 'video'
      });
  
      const videoUrl = uploadResult.secure_url;
  
  
      const course = await coursemodel.findByIdAndUpdate(
        courseId,
        { $push: { videos: { sub_title: sub_title, url: videoUrl } } },
        { new: true }
      );
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
    
      fs.unlinkSync(uploadedVideo.path);
  
      res.status(200).json({ message: 'Video uploaded and course updated successfully', videoUrl });
    } catch (error) {
      console.error(error);
  
   
      if (uploadedVideo && uploadedVideo.path) {
        fs.unlinkSync(uploadedVideo.path);
      }
  
      res.status(500).json({ message: 'Error uploading video', error });
    }
  };
  
 
  



  module.exports={getcourses, updateCourse, uploadVideos}