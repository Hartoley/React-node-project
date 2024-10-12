const express = require("express");
const upload = require("../utils/mutler");
const router = express.Router();
const { validate } = require("../Middleware/validator");
const { adminvalidator } = require("../Middleware/adminvalidator");
const {
  getcourses,
  updateCourse,
  uploadVideos,
  getAllVideos,
  getCourseData,
  updateCourseData,
  deleteCourse,
} = require("../Controller/courses.controller");

router.get("/courses", getcourses);
router.post("/upload/course", upload.single("video_preview"), updateCourse);
router.get("/getallcourses", getAllVideos);
router.get("/course/:courseId", getCourseData);
router.post("/update/course/:courseId", updateCourseData);
router.post(
  "/upload/video/:courseId",
  upload.single("video_url"),
  uploadVideos
);
router.delete("/delete/:courseId", deleteCourse);

module.exports = router;
