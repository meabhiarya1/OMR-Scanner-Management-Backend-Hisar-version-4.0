// routes/users.js
const express = require('express');
const router = express.Router();
const createUser = require("../controllers/CreateUser")
const allUser = require("../controllers/Alluser")
const singleUser = require("../controllers/singleUser")
const updatedUser = require("../controllers//UpdateUser")
const deleteUser = require("../controllers/DeleteUser")
const logIn = require("../controllers/Login")
const authMiddleware = require("../middleware/authMiddleware")
// Create a new user
router.post('/createuser', authMiddleware, createUser );

// Get all users
router.post('/getallusers',authMiddleware, allUser);

// get single user 
router.post('/getuser',authMiddleware ,singleUser );

// updated user
router.post('/updateuser/:id', authMiddleware,  updatedUser);

// delete user
router.post('/deleteuser/:id' , authMiddleware, deleteUser)

// login user
router.post('/login', logIn)

module.exports = router;
