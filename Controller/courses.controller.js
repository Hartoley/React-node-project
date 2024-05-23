const { adminvalidator } = require("../Middleware/adminvalidator");
const bcrypt = require("bcryptjs")
const upload = require('../utils/mutler')
const {coursemodel} = require ('../Model/courses.model')
const {cloudinary} =require('../utils/clodinary')
const fs = require('fs');



const getcourses =(req, res) =>{
    res.render("coursestemp")
  }




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
    const { sub_title} = req.body; 
    const courseMain = req.params.courseId;
    const uploadedVideo =  req.file;
   
    // console.log(sub_title);
    console.log('uploadedVideo:', uploadedVideo)
    console.log('Uploaded file path:', uploadedVideo.path);
   
  
    try {
      if (!uploadedVideo) {
        return res.status(406).json({ message: 'Please select a video to upload' });
      }

      const course = await coursemodel.findById(courseMain);
     
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const validVideoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
      if (validVideoExtensions) {
        console.log("Video format is valid");
      }
      const fileExtension = uploadedVideo.originalname.split('.').pop().toLowerCase();
  
      if (!validVideoExtensions.includes(fileExtension)) {
        fs.unlinkSync(uploadedVideo.path);
        return res.status(400).json({ message: 'Invalid video file type' });
      }

      const uploadResult = await cloudinary.uploader.upload(uploadedVideo.path, {
        resource_type: 'video'
      });

      const videoUrl = uploadResult.secure_url;

      const updatedCourse = await coursemodel.findByIdAndUpdate(
        course._id,
        { $push: { videos: { sub_title, url: videoUrl } } },
        { new: true }
      );
  
      if (!updatedCourse) {
        console.error('Error updating course schema');
        return res.status(500).json({ message: 'Internal server error' });
      }

     fs.unlink(uploadedVideo.path);
  
      res.status(200).json({ message: 'Video uploaded and course updated successfully', videoUrl });
    } catch (error) {
      console.error(error);
      if (error.name === 'CastError') {
        res.status(409).json({ message: 'Invalid course ID' });
      } else {
        
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
  
  


  module.exports={getcourses, updateCourse, uploadVideos}