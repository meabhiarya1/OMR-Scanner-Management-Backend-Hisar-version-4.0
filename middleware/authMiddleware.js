const jwt = require("jsonwebtoken");
const User = require("../models/User");
const secretKey = "omrscanner";

const authMiddleware = async (req, res, next) => {
  const { token } = req.body;
  console.log(req.body.token, "--token");
  if (!token) {
    return res.status(500).json({ message: "Token Not Exist" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log("decoded");
    // const admin = decoded.role === "Admin";
    // const moderator = decoded.role === "Moderator";
    // const operator = decoded.role === "Operator";
    const user = await User.findOne({
      where: { id: decoded.userId, email: decoded.email, role: decoded.role },
    });

    if (!user) {
      return res.status(500).json({ message: "user not found", status: false });
    }
    console.log(user.permissions);
    req.permissions = user.permissions;
    req.role = user.role;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = authMiddleware;
