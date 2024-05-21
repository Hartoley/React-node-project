const { adminvalidator } = require("../Middleware/adminvalidator");
const {studentmodel, studentlogmodel} = require("../Model/student.model")
const bcrypt = require("bcryptjs")
const upload = require('../utils/mutler')
const {coursemodel} = require ('../Model/courses.model')
const {cloudinary} =require('../utils/clodinary')
const multer = require('../utils/mutler')



const getcourses =(req, res) =>{
    res.render("coursestemp")
  }

const uploadvideo = async (req, res) => {
    try {
      const uploadMiddleware = upload.single('video_url');
      uploadMiddleware(req, res, async function (err) {
        if (err) {
          console.error(err);
          res.status(400).send({ message: 'Error processing file', status: false });
          return;
        }
        console.log(req.file.originalname);
        
        const { video_title, sub_title } = req.body;
        console.log(video_title);
        console.log(sub_title);
        console.log(req.file);
        const file = req.file;
        console.log(file);
  
        if (!video_title || !sub_title ) {
          res.status(400).send({ message: 'Missing required fields', status: false });
          return;
        }
        if (!file) {
          res.status(400).send({ message: 'Missing Video file', status: false });
          return;
        }
  
        const uploder = await cloudinary.uploader.upload(req.file.buffer, {
          resource_type: 'video',
        });
  
        if (!uploder) {
          res.status(400).send({ message: 'Error uploading video', status: false });
          return;
        }
  
        const existingcourse = await coursemodel.findOne({ video_title: video_title });
  
        if (existingcourse) {
          res.status(405).send({ message: 'Course already exists', status: false });
          return;
        }
  
        const course = await coursemodel.create({
          video_title,
          sub_title,
          video_url: uploder.secure_url,
        });
  
        if (!course) {
          res.status(409).send({ message: 'Unable to upload course', status: false });
          return;
        }
  
        res.status(200).send({ message: 'Course uploaded', status: true, url: uploder.secure_url });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  };

  const updateCourse = async (req, res) => {
    try {
      // const { id } = req.params;
      const { authors_name, language, learn, requirements, description, price } = req.body;
  
      const updatedCourse = await coursemodel.updateOne(
        { video_title: title },
        {
          $set: {
            title,
            subtitle,
            authors_name,
            language,
            learn,
            requirements,
            description,
            price,
          },
        }
      );
  
      if (!updatedCourse) {
        res.status(404).send({ message: "Course not found", status: false });
      }
  
      res.status(200).send({ message: "Course updated", status: true });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  };

  module.exports={getcourses, uploadvideo, updateCourse}