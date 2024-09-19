const { adminvalidator } = require("../Middleware/adminvalidator");
const {studentmodel, studentlogmodel, courseProgress} = require("../Model/student.model")
const {coursemodel} = require ('../Model/courses.model')
const bcrypt = require("bcryptjs")
const axios = require('axios');
const { Reference } = require("yup");




const studentsignup = async(req, res) =>{
  try {
      // console.log( req.body, "body");
      const {username, email, password} = req.body
      if (username === "" || password === "" || email === "") {
         res.status(402).send({message:"input fields cannot be empty", status: false}) 
      }
  
      const validate = await adminvalidator.validate(req.body)
      if (!validate) {
        res.status(400).send({message:"unable to validate user", status: false}) 
      }
      const existinguser = await studentmodel.findOne({email:email})
       console.log(existinguser);
       if (existinguser) {
          res.status(405).send({message:"user already exist", status:false})
       }
       const student = await studentmodel.create({username, email, password})
       if (!student) {
          res.status(409).send({message:"unable to save user", status:false})
       }

       return res.status(200).send({message:"user signed up successfully", status:true})
  
  }catch(error){
    console.log(error);
    if (error.code === 11000) {
      res.status(409).send({message:"user already exists with this email"})
    } else {
      res.status(500).send({message:'internal server error'})
    }
  }
}
  
const studentlogin = async (req, res) => {
      const { email, password } = req.body;
      // console.log(req.body);
      try {
        if (email === "" || password === "") {
          return res.status(401).send({ message: 'input fields cannot be empty', status: false });
        }
    
        const student = await studentmodel.findOne({ email: email });
        if (!student) {
          return res.status(403).send({ message: 'user not found', status: false });
        }

        const hashpassword = await bcrypt.compare( password, student.password);
        if (!hashpassword) {
          return res.status(405).send({ message: 'invalid password', status: false });
        }
    
        const studentemail = student.email;
        const inalrealdy = await studentlogmodel.findOne({ email: email });
  
        if (!inalrealdy) {
          const loggedinstudents = await studentlogmodel.create({ email, password });
          console.log("It was a success");
          if (!loggedinstudents) {
            console.log("Saving logged in student failed");
          }
        }
        return res.status(200).send({ message: 'student logged in successful', status: true, studentemail , });
       
      }catch (error) {
        console.log(error);
        return res.status(408).send({ message: 'internal server error' });
      }
    }


const studentdash = (req, res)=>{
    res.render("index12")
}

const getstudentsignup = (req, res) =>{
    res.render("studentsignup")
}

const getstudentlogin =(req, res) =>{
  res.render("studentlogin")
}

const getData = async (req, res) => {
  try {
    const data = await studentmodel.find({});
    if (data.length === 0) {
      console.log('No data found');
      res.status(404).send({ message: 'No data found' });
    } else {
      console.log(data);
      data.forEach((student) => {
        console.log(student.username);
      });
      res.status(200).send(data); 
    }
  } catch (err) {
    console.log(err );
    res.status(500).send({ message: 'Internal server error' });
  }
};

const getloggin = async (req, res) => {
  try {
    
    const studentdata = await studentmodel.find({});
    if (studentdata.length === 0) {
      console.log('No data found');
      res.status(404).send({ message: 'No data found' });
    } else {
      console.log(studentdata); 
      studentdata.forEach((student) => {
        console.log(student.username);
      });
      res.status(200).send(studentdata);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};


const updaterId = async (req, res) =>{
  try {
   const student = req.params.id;
   const studentIn = await studentmodel.findById(student);
   if (!studentIn) {
     return res.status(404).send("student not found");
   }

   res.send(studentIn);
  } catch (error) {
   return res.status(408).send("student not found shoooo");
  }
}



const paidCourses = async (req, res) => {
  try {
    const { courseTitle, courseId, userId, reference } = req.body;
    console.log(userId);
    console.log(courseTitle , userId , courseId );
    
    const student = await studentmodel.findByIdAndUpdate(userId, {
      $push: {
        courses: {
          courseId: courseId,
          courseTitle: courseTitle,
          paid: true,
          Reference: reference,
          certified: false
        }
      }
    }, { new: true });
    if (!student) {
      return res.status(404).send("user not found");
    }
    res.json({ message: "Course added successfully" });
  }catch (error) {
    console.error("Error updating user:", error.message, error.stack);
    return res.status(500).send("Error updating user");
  }
};


const getAllPaidCourses = async (req, res) => {
  try {
    const id = req.params.id;

    const student = await studentmodel.findById(id);
    if (!student) {
      return res.status(404).send("User not found");
    }

    const courseIds = student.courses.map(course => course.courseId);
    const courses = await coursemodel.find({ _id: { $in: courseIds } });
    res.status(200).send(courses);
    
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res.status(500).send("Error fetching courses");
  }
};


const videoProgress = async (req, res) => {
  const { userId, courseId, videoId } = req.body;
  
  if (!userId || !courseId || !videoId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let progressEntry = await courseProgress.findOne({
      studentId: userId,
      courseId: courseId,
    });

    if (!progressEntry) {
      progressEntry = new courseProgress({
        studentId: userId,
        courseId: courseId,
        progress: [{ videoId, watched: true }],
      });
      await progressEntry.save();
      return res.status(201).json({ message: 'Progress created successfully', watched: true });
    }

    const existingVideoProgress = progressEntry.progress.find(p => p.videoId.toString() === videoId);

    if (existingVideoProgress) {
      existingVideoProgress.watched = true;
      existingVideoProgress.watchedAt = Date.now();
    } else {
      progressEntry.progress.push({ videoId, watched: true });
    }

    await progressEntry.save();
    console.log('Progress updated successfully');
    
    res.status(200).json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
};




const getallstudents = async (req, res) =>{
  try {
    const allstudents = await studentmodel.find({});

    if (allstudents.length === 0) {
      console.log('No data found');
      res.status(404).send({ message: 'No data found' });
    } else {
      
      allstudents.forEach((students) => {
        // console.log(students.username);
      });
      res.status(200).send(allstudents); 
    }
  } catch (error) {
    console.log(error );
    res.status(500).send({ message: 'Error getting all students' });
  }
}

const isVideoWatched = async (req, res) => {
  const { userId, courseId, videoId } = req.body;
  if (!userId || !courseId || !videoId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const progressEntry = await courseProgress.findOne({
      studentId: userId,
      courseId: courseId,
    });

    if (!progressEntry) {
      return res.status(200).json({ watched: false });
    }
    const videoProgress = progressEntry.progress.find(p => p.videoId.toString() === videoId);

    if (videoProgress) {
      return res.status(200).json({ watched: videoProgress.watched });
    } else {

      return res.status(200).json({ watched: false });
    }
  } catch (error) {
    console.error('Error checking video status:', error);
    return res.status(500).json({ message: 'Error checking video status' });
  }
};


const checkCertificationEligibility = async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const course = await coursemodel.findById(courseId);
    if (!course) {
      return res.status(200).json({ failed: true, message: 'You are almost there' });
    }

    const progressEntry = await courseProgress.findOne({
      studentId: userId, 
      courseId: courseId,
    });

    if (!progressEntry) {
      return res.status(200).json({ failed: true, message: 'You are almost there' });
    }

    const allVideos = course.videos;
    const watchedVideos = progressEntry.progress;

    const allWatched = allVideos.every(video => {
      const videoProgress = watchedVideos.find(v => v.videoId.toString() === video._id.toString());
      return videoProgress && videoProgress.watched;
    });

    if (allWatched) {
      return res.status(200).json({ success: true, message: 'Student is eligible for certification.' });
    } else {
      return res.status(200).json({ failed: true, message: 'Not all videos have been watched.' });
    }
  } catch (error) {
    console.error('Error checking certification eligibility:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while checking eligibility.' });
  }
};




module.exports = {studentsignup, videoProgress, checkCertificationEligibility, isVideoWatched, getAllPaidCourses, updaterId,paidCourses, getloggin, studentlogin, getallstudents, getData, getstudentlogin, getstudentsignup, studentdash}