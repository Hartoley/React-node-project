const express = require("express")
const router = express.Router()
const {validate} = require("../Middleware/validator")
const {adminvalidator} = require ("../Middleware/adminvalidator")
const {admindash, getadminsignup, adminsignup, getadminlogin} = require("../Controller/admin.controller")


router.get('/', admindash)
router.get('/admindash',  getadminsignup)
router.get('/admin/login', getadminlogin)
router.post('/admin/register', adminsignup)



module.exports = router