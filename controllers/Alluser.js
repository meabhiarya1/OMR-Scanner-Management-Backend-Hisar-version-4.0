const User = require("../models/User")

const getUsers=  async (req, res) => {
        try {
            const users = await User.findAll();
            console.log(users)
            res.status(201).json({ message: "Users get successfully", users });

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
module.exports =  getUsers;