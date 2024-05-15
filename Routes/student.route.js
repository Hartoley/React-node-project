const express = require("express")
const router = express.Router()
const {validate} = require("../Middleware/validator")
const {adminvalidator} = require ("../Middleware/adminvalidator")
const { studentsignup, studentlogin, getstudentsignup, getstudentlogin, studentdash, getData , updaterId, getallstudents } = require("../Controller/student.controller")


router.get('/udemy', studentdash)
router.post('/student/register', studentsignup)
router.post('/student/login', studentlogin)
router.get('/studentdash',  getstudentsignup)
router.get('/student/dashlogin', getstudentlogin)
router.get('/student/getdata', getData)
router.get('/student/getallstudent', getallstudents)
router.get('/student/getdata/id/:id', updaterId)



module.exports = router