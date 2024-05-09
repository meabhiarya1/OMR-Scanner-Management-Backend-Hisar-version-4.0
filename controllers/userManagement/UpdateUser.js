// controllers/userController.js

const User = require("../../models/User");

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { userName, mobile, role, email, password, permissions } =
    req.body.selectedUser;
  const userRole = req.role;
  if (userRole !== "Admin") {
    return res.status(500).json({ msg: "Only Admin can create user" });
  }
  console.log(role);
  try {
    let user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userName = userName || user.userName;
    user.mobile = mobile || user.mobile;
    user.email = email || user.email;
    user.role = role || user.role;
    user.password = password || user.password;
    user.permissions = permissions || user.permissions;

    await user.save();
    console.log(user)
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = updateUser;
