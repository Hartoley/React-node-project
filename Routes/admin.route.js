const express = require("express")
const router = express.Router()
const {validate} = require("../Middleware/validator")
const {adminvalidator} = require ("../Middleware/adminvalidator")
const {admindash, getadminsignup, adminsignup, getadminlogin, getData, adminlogin, getloggin} = require("../Controller/admin.controller")


router.get('/', admindash)
router.get('/admindash',  getadminsignup)
router.get('/admin/dashlogin', getadminlogin)
router.post('/admin/register', adminsignup)
router.post('/admin/login', adminlogin)
router.get('/admin/getdata', getData)
router.get('/admin/getlogin/:id', getloggin)
router.get('/admin/getloginid', getlogginId)



module.exports = router