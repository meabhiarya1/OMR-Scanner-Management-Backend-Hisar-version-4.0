const UserActivity = require("../../models/UserActivity");

const userDetails = async (req, res) => {
  const userId = req.params.id;

  try {
    // Validate the userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userActivitydetails = await UserActivity.findAll({
      where: {
        userId: userId,
      },
    });

    // Check if any activity records were found
    if (!userActivitydetails || userActivitydetails.length === 0) {
      return res.status(404).json({ error: "No activity found for this user" });
    }

    res.status(200).json({ userActivitydetails });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching user activity details", details: err.message });
  }
};

module.exports = userDetails;
