const express = require ("express")
const app = express()
const mongoose = require('mongoose')
const cors = require("cors")
require('dotenv').config()
const ejs = require('ejs')
app.set("view engine", "ejs")
app.use(cors({origin:"*"}))
app.use(express.urlencoded({extended:true, limit:"100mb"}))
const adminrouter = require('./Routes/admin.route')
app.use('/', adminrouter)






const port = process.env.PORT || 5008
const uri = process.env.MONGODB_URI

const connect = async () =>{
    try {
      const connected = await mongoose.connect(uri) 
     if (connected) {
        console.log("connected to database");
     }
    } catch (error) {
       console.log(error);  
    }
}
connect()

app.listen(port,()=>{
    console.log("app started at port" + port);
 })