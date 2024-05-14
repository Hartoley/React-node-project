const express = require("express")
const router = express.Router()
const {validate} = require("../Middleware/validator")
const {adminvalidator} = require ("../Middleware/adminvalidator")
const { studentsignup, studentlogin, getstudentsignup, getstudentlogin, studentdash, getData , updaterId } = require("../Controller/student.controller")


router.get('/udemy', studentdash)
router.post('/student/register', studentsignup)
router.post('/student/login', studentlogin)
router.get('/studentdash',  getstudentsignup)
router.get('/student/dashlogin', getstudentlogin)
router.get('/admin/getdata', getData)
router.get('/admin/getdata/id/:id', updaterId)



module.exports = router