const jwt = require("jsonwebtoken");
const User = require("../models/User");
const secretKey = "omrscanner";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;

  // console.log(req.body, "--token",req.files);
  // console.log(token,"token")
  if (!token) {
    return res.status(500).json({ message: "Token Not Exist" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findOne({
      where: { id: decoded.userId, email: decoded.email, role: decoded.role },
    });

    if (!user) {
      return res.status(500).json({ message: "user not found", status: false });
    }
    req.user = user;
    req.permissions = user.permissions;
    req.role = user.role;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = authMiddleware;
