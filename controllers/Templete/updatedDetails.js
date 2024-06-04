const UpdatedData = require("../../models/TempleteModel/updatedData");

const updatedDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID not provided" });
    }

    let userData;
    try {
      userData = await UpdatedData.findAll({
        where: {
          userId: userId,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({ error: "Database error occurred" });
    }

    if (!userData || userData.length === 0) {
      return res
        .status(404)
        .json({ error: "No data found for the given user ID" });
    }

    // Structure the response data
    const response = {
      updatedColumn: [],
      previousData: [],
      currentData: [],
      rowIndex: [],
    };

    userData.forEach((data) => {
      if (data.updatedColumn && data.previousData && data.currentData && data.rowIndex) {
        response.updatedColumn.push(data.updatedColumn);
        response.previousData.push(data.previousData);
        response.currentData.push(data.currentData);
        response.rowIndex.push(data.rowIndex);
      } else {
        console.warn("Incomplete data entry found:", data);
        return res.status(500).json({ error: "Incomplete data entry found" });
      }
    });

    if (response.updatedColumn.length === 0) {
      return res.status(500).json({ error: "No complete data entries found" });
    }

    return res.json(response);
  } catch (error) {
    console.error("Error fetching updated details:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
};

module.exports = updatedDetails;
