const { adminvalidator } = require("../Middleware/adminvalidator");
const {adminmodel, adminlogmodel} = require("../Model/admin.model")
const bcrypt = require("bcryptjs")



const adminsignup = async(req, res) =>{
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
        const existinguser = await adminmodel.findOne({email:email})
         console.log(existinguser);
         if (existinguser) {
            res.status(405).send({message:"user already exist", status:false})
         }
         const admin = await adminmodel.create({username, email, password})
         if (!admin) {
            res.status(409).send({message:"unable to save user", status:false})
         }
        
         return res.status(200).send({message:"user signed up successfully", status:true})
    
    }catch(error){
      console.log(error);
      if (error) {
        res.status(407).send({message:error.message})
      }
      return res.status(500).send({message:'internal server error'})
    
    }
    }
  
    
    const adminlogin = async (req, res) => {
      const { email, password } = req.body;
      // console.log(req.body);
      try {
        if (email === "" || password === "") {
          return res.status(401).send({ message: 'input fields cannot be empty', status: false });
        }
    
        const admin = await adminmodel.findOne({ email: email });
        if (!admin) {
          return res.status(403).send({ message: 'user not found', status: false });
        }
    
        const hashpassword = await bcrypt.compare(password, admin.password);
        if (!hashpassword) {
          return res.status(405).send({ message: 'invalid password', status: false });
        }
    
        const adminemail = admin.email;
        const inalrealdy = await adminlogmodel.findOne({ email: email });
  
        if (!inalrealdy) {
          const loggedinadmins = await adminlogmodel.create({ email, password });
          console.log("It was a success");
          if (!loggedinadmins) {
            console.log("Saving logged in admin failed");
          }
        }
        return res.status(200).send({ message: 'admin logged in successful', status: true, adminemail });
       
      }catch (error) {
        console.log(error);
        return res.status(408).send({ message: 'internal server error' });
      }
    }
    

const admindash = (req, res)=>{
    res.render("index")
}

const getadminsignup = (req, res) =>{
    res.render("admin")
}

const getadminlogin =(req, res) =>{
  res.render("adminlogin")
}

const getData = async (req, res) => {
  try {
    const data = await adminmodel.find({});
    if (data.length === 0) {
      console.log('No data found');
      res.status(404).send({ message: 'No data found' });
    } else {
      console.log(data);
      data.forEach((admin) => {
        console.log(admin.username);
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
    const admindata = await adminlogmodel.find({});
    if (admindata.length == 0) {
      console.log('No data found');
      res.status(404).send({ message: 'No data found' });
    } else {
      console.log(admindata); 
      admindata.forEach((admin) => {
        console.log(admin.username);
      });
      res.status(200).send(admindata);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};


module.exports = {admindash, adminsignup, getadminsignup, getadminlogin, adminlogin, getData, getloggin}