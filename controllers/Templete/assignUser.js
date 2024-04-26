const Assigndata = require("../../models/TempleteModel/assigndata");

const assignUser = async (req, res, next) => {
  const { userId, templeteId, fileId, max, min } = req.body;

  try {
    // Create a new row in Assigndata
    await Assigndata.create({
      userId: userId,
      templeteId: templeteId,
      fileId: fileId,
      max: max,
      min: min
    });

    return res.status(200).json({ message: "User assigned successfully" });
  } catch (error) {
    console.error("Error assigning user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = assignUser;
