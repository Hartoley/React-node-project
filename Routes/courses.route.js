const express = require("express")
const upload = require('../utils/mutler')
const router = express.Router()
const {validate} = require("../Middleware/validator")
const {adminvalidator} = require ("../Middleware/adminvalidator")
const { getcourses, updateCourse, uploadVideos } = require("../Controller/courses.controller")

router.get('/courses', getcourses)
router.post('/upload/course', updateCourse)
router.post('/upload/video/:courseId',  upload.single("video_url"), uploadVideos)



module.exports = router