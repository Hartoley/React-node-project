const { adminvalidator } = require("../Middleware/adminvalidator");
const {studentmodel, studentlogmodel} = require("../Model/student.model")
const bcrypt = require("bcryptjs")
const axios = require('axios')




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




const getallstudents = async (req, res) =>{
  try {
    const allstudents = await studentmodel.find({});

    if (allstudents.length === 0) {
      console.log('No data found');
      res.status(404).send({ message: 'No data found' });
    } else {
      
      allstudents.forEach((students) => {
        console.log(students.username);
      });
      res.status(200).send(allstudents); 
    }
  } catch (error) {
    console.log(error );
    res.status(500).send({ message: 'Error getting all students' });
  }
}





module.exports = {studentsignup, updaterId, getloggin, studentlogin, getallstudents, getData, getstudentlogin, getstudentsignup, studentdash}