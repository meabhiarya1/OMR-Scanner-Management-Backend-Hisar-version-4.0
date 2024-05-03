const bcrypt = require("bcryptjs");
const User = require("../../models/User");

const createUser = async (req, res) => {
  console.log(req.body)
  const { userName, mobile,role, email, password, permissions } = req.body.userData
  const userRole = req.role;


  if(userRole !== "Admin"){
    return res.status(500).json({message: "Only Admin can create user"});
  }
  
  if (!userName || !mobile || !email || !password || !permissions || !role) {
    return res.status(422).json({ error: "Please fill all fields properly" });
  }

  const parsedPermissions =
    typeof permissions === "string" ? JSON.parse(permissions) : permissions;

  try {
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      return res.status(422).json({ error: "Email already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 12); // Hash the password
      const newUser = await User.create({
        userName,
        mobile,
        email,
        password: hashedPassword, // Set the hashed password
        role,
        permissions: parsedPermissions,
      });
      res.status(201).json({ message: "User created successfully", newUser });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
module.exports = createUser;
