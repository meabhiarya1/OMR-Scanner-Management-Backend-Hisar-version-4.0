const User = require("../models/User");

const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json({ message: "user get successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports =  getSingleUser;
