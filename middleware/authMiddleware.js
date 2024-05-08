const jwt = require("jsonwebtoken");
const User = require("../models/User");
const secretKey = "omrscanner";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token Not Provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findOne({
      where: { id: decoded.userId, email: decoded.email, role: decoded.role },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid User" });
    }
    
    // Attach user permissions and role to the request object
    req.permissions = user.permissions;
    req.role = user.role;
    req.user = user;
    next();
  } catch (error) {
    // If JWT verification fails, return an unauthorized error
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

module.exports = authMiddleware;
