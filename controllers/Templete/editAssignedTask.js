const AssignData = require("../../models/TempleteModel/assigndata");

const editAssignedTask = async (req, res) => {
  const { assignId, userId } = req.body;

  try {
    // Update the userId for the record with the specified assignId
    const [updated] = await AssignData.update(
      { userId: userId }, // Update the userId
      { where: { id: assignId } } // Filter by assignId
    );

    if (updated) {
      // Fetch the updated task to return in the response
      const updatedTask = await AssignData.findOne({ where: { id: assignId } });
      res.status(200).json({ message: "Updated successfully" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = editAssignedTask;
