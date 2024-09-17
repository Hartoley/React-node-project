const express = require("express")
const router = express.Router()
const {validate} = require("../Middleware/validator")
const {adminvalidator} = require ("../Middleware/adminvalidator")
const { studentsignup, studentlogin, getstudentsignup, getstudentlogin, studentdash, getData , updaterId, getallstudents, paidCourses, getAllPaidCourses, videoProgress } = require("../Controller/student.controller")


router.get('/udemy', studentdash)
router.post('/student/register', studentsignup)
router.post('/student/login', studentlogin)
router.get('/studentdash',  getstudentsignup)
router.get('/student/dashlogin', getstudentlogin)
router.get('/student/getdata', getData)
router.get('/student/getallstudent', getallstudents)
router.get('/student/getdata/id/:id', updaterId)
router.post('/student/payment', paidCourses)
router.get('/student/paidCourses/id/:id', getAllPaidCourses)
router.post('/student/updateProgress', videoProgress)


module.exports = router