const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const secretKey = "omrscanner";

const getSingleUser = async (req, res) => {
  // console.log(">>>>>>>>>>>>>>>>>>>>>>>", req.user);
  const user = req.user;
  res.status(200).json({ message: "User retrieved successfully", user });

  // try {
  //   // Retrieve user permissions and role from the request object
  //   const { permissions, role } = req;
  //   console.log(user)
  //   // You can use permissions and role as needed in your controller logic
  //   console.log("User Permissions:", permissions);
  //   console.log("User Role:", role);

  //   // If you need to retrieve more user details, you can query the database
  //   // using the user's ID, which can also be obtained from the decoded JWT token
  //   const userId = req.userId;
  //   const selectedAttributes = [
  //     "id",
  //     "userName",
  //     "mobile",
  //     "email",
  //     "permissions",
  //     "role",
  //   ];
  //   const user = await User.findOne({
  //     where: { id: userId },
  //     attributes: selectedAttributes,
  //   });

  //   if (!user) {
  //     return res.status(404).json({ message: "User not found" });
  //   }

  //   res.status(200).json({ message: "User retrieved successfully", req.user });
  // } catch (err) {
  //   console.error("Error retrieving user:", err);
  //   res.status(500).json({ message: "Internal server error" });
  // }
};

module.exports = getSingleUser;

