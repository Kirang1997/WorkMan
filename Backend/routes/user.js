const { query } = require('express');
const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

var auth = require('../services/authontication');
var checkRole = require('../services/checkRole');
router.post('/signup', (req, res) => {
    let user = req.body;

    queryselect = "SELECT `email` FROM `login` WHERE `email`=?"
    connection.query(queryselect, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                queryinsert = "INSERT INTO `login` (`name`,`contactNumber`,`email`,`Password`,`officelocation`,`role`,`status`)values(?,?,?,?,'Ratnagiri','Employee','False')";
                connection.query(queryinsert, [user.name, user.contactNumber, user.email, user.password], (err, result) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfuly Registered." });
                    } else {
                        return res.status(500).json(err);
                    }
                });
            } else {
                return res.status(400).json({ message: "Account Already Exist." });
            }

        } else {
            return res.status(500).json(err);
        }
    });
})
router.post('/login', (req, res) => {
    let user_values = req.body;
    query_select_user = "SELECT `email`,`Password`,`role`,`status` FROM `login` WHERE `email`=? AND `Password`=?"
    connection.query(query_select_user, [user_values.email, user_values.password], (err, result) => {
        if (!err) {
            if (result.length <= 0 || result[0].Password != user_values.password) {
                return res.status(400).json({ message: "Incorrect Username Password." });
            }
            else if (result[0].status === 'False') {
                return res.status(401).json({ message: "Wait For admin aprroval." });
            }
            else if (result[0].Password == user_values.password) {

                const response = { email: result[0].email, role: result[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({ token: accessToken });
            } else {
                return res.status(401).json({ message: "Something went wrong.Please try again later." });
            }

        } else {
            return res.status(500).json(err);
        }

    });
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgetpassword', (req, res) => {
    let reqbody = req.body;
    query_forgetpass = "SELECT `email`,`Password` FROM `login` WHERE `email`=?"
    connection.query(query_forgetpass, [reqbody.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                return res.status(200).json({ message: "Unknown email address." });
            } else {
                var mailContent = {
                    from: process.env.EMAIL,
                    to: result[0].email,
                    subject: 'WorkMan Account Password ',
                    html: '<p><b>Your Login details form WorkMan Account</b><br><b>Email</b>' +
                        result[0].email + '<br><b>Password</b>' +
                        result[0].Password + '<a href="http://localhost:4200/">click here to login</a></p>'
                };
                transporter.sendMail(mailContent, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Email Sent : " + info.response);
                    }
                });
                return res.status(200).json({ message: "Password send sucessfully to your email. " });
            }
        } else {
            return res.status(500).json(err);
        }
    });
})

router.get('/getUsers', auth.authonticateToken, (req, res) => {

    querySelectUsers = "SELECT * FROM `login` WHERE `role`='Employee'";
    connection.query(querySelectUsers, (err, result) => {
        if (!err) {
            return res.status(200).json(result);

        } else {
            return res.status(500).json(err);
        }
    });
})

router.patch('/updateUser', auth.authonticateToken, (req, res) => {
    let reqBody = req.body;
    query_upate = "UPDATE `login` SET `status`=? WHERE `id`=?";
    connection.query(query_upate, [reqBody.status, reqBody.id], (err, result) => {
        if (!err) {
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: "User id doesnot exist." });
            }
            return res.status(200).json({ message: "User status updated successfuly." });
        } else {
            return res.status(500).json(err);
        }
    });
})

router.get('/checkToken', auth.authonticateToken, (req, res) => {

    return res.status(200).json({ message: "True" });
})


router.post('/changePassword', auth.authonticateToken, (req, res) => {
    let reqBody = req.body;
    query_upate = "UPDATE `login` SET `status`=? WHERE `id`=?";
    connection.query(query_upate, [reqBody.status, reqBody.id], (err, result) => {
        if (!err) {
            if (result.affectedRows == 0) {
                return res.status(404).json({ message: "User id doesnot exist." });
            }
            return res.status(200).json({ message: "User status updated successfuly." });
        } else {
            return res.status(500).json(err);
        }
    });
})

module.exports = router; 