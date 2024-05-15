const express = require("express")
const router = express.Router()
const {validate} = require("../Middleware/validator")
const {adminvalidator} = require ("../Middleware/adminvalidator")
const { getcourses, uploadvideo, updateCourse } = require("../Controller/courses.controller")

router.get('/courses', getcourses)
router.post('/upload/video', uploadvideo)
router.post('/upload/course', updateCourse)




module.exports = router