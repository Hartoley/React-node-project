const { adminvalidator } = require("../Middleware/adminvalidator");
const adminmodel = require("../Model/admin.model")


const adminsignup = async(req, res) =>{
    try {
        console.log( req.body, "body");
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
    
const adminlogin = async (req, res)=>{
  try {
    const {email, password} = req.body
    if (email=="" || password =="") {
      res.status(401).send({message:'input filed cannot be empty', status: false})
    }
    const admin = await adminmodel.findOne({email:email})
    if (!admin) {
      res.status(403).send({message: 'user not found', status: false})
    }
    const hashpassword = await bcrypt.compare(password == admin.password)
    if (!hashpassword) {
      res.status(405).send({message: 'invalud password', status: false})
    }
    const adminemail = admin.email

    res.status(200).send({message:'admin logged in successful', status: true})
  } catch (error) {
    res.status(408).send({message: 'internal server error'})
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
    console.log(data.username);
    res.status(200).send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal server error' });
  }
};







module.exports = {admindash, adminsignup, getadminsignup, getadminlogin, adminlogin, getData}