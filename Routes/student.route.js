const express = require("express");
const router = express.Router();
const { validate } = require("../Middleware/validator");
const { adminvalidator } = require("../Middleware/adminvalidator");
const {
  studentsignup,
  studentlogin,
  getstudentsignup,
  getstudentlogin,
  studentdash,
  getData,
  updaterId,
  getallstudents,
  paidCourses,
  getAllPaidCourses,
  videoProgress,
  isVideoWatched,
  checkCertificationEligibility,
  getStudentProgressData,
  getStudents,
  deleteStudent,
  approveCertification,
} = require("../Controller/student.controller");

router.get("/udemy", studentdash);
router.post("/student/register", studentsignup);
router.post("/student/login", studentlogin);
router.get("/studentdash", getstudentsignup);
router.get("/student/dashlogin", getstudentlogin);
router.get("/student/getdata", getData);
router.get("/student/getallstudent", getallstudents);
router.get("/student/getStudents/:courseId", getStudents);
router.get("/student/getdata/id/:id", updaterId);
router.post("/student/payment", paidCourses);
router.get("/student/paidCourses/id/:id", getAllPaidCourses);
router.post("/student/updateProgress", videoProgress);
router.post("/student/isWatched", isVideoWatched);
router.get("/student/data/id/:id", getStudentProgressData);
router.delete("/delete/:id", deleteStudent);
router.post("/approve/:studentId/:courseId", approveCertification);

router.post("/student/certification", checkCertificationEligibility);

module.exports = router;
