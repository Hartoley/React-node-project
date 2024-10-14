const express = require("express");
const router = express.Router();
const { validate } = require("../Middleware/validator");
const { adminvalidator } = require("../Middleware/adminvalidator");
const {
  admindash,
  getadminsignup,
  adminsignup,
  getadminlogin,
  getData,
  adminlogin,
  getloggin,
  updaterId,
  notification,
  studentNotifications,
} = require("../Controller/admin.controller");

router.get("/", admindash);
router.get("/admindash", getadminsignup);
router.get("/admin/dashlogin", getadminlogin);
router.post("/admin/register", adminsignup);
router.post("/admin/login", adminlogin);
router.get("/admin/getdata", getData);
router.get("/admin/notifications", notification);
router.get("/admin/getdata/id/:id", updaterId);
router.get("/admin/getlogin/:id", getloggin);
router.get("/students/notifications/:studentId", studentNotifications);

module.exports = router;
