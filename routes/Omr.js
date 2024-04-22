// routes/users.js
const express = require('express');
const router = express.Router();
const createUser = require("../controllers/CreateUser")
const allUser = require("../controllers/Alluser")
const singleUser = require("../controllers/singleUser")
const updatedUser = require("../controllers//UpdateUser")
const deleteUser = require("../controllers/DeleteUser")
const logIn = require("../controllers/Login")
// Create a new user
router.post('/createuser',  createUser );

// Get all users
router.get('/getallusers', allUser);

// get single user 
router.get('/getuser/:id', singleUser );

// updated user
router.put('/updateuser/:id', updatedUser);

// delete user
router.delete('/deleteuser/:id' , deleteUser)

// login user
router.post('/login', logIn)

module.exports = router;
