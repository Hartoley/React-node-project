const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { object } = require("yup");

const studentschema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  courses: [{type: Object, trim: true}],
});

const stdloginschema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true, trim: true },
});

let saltRound = 10;
studentschema.pre("save", function (next) {
  console.log(this.password);
  bcrypt
    .hash(this.password, saltRound)
    .then((hashpassword) => {
      this.password = hashpassword;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

const studentmodel = mongoose.model("student_collection", studentschema);
const studentlogmodel = mongoose.model("studentlog_collection", stdloginschema)
module.exports = {studentmodel, studentlogmodel}
