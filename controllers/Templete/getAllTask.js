const Assigndata = require("../../models/TempleteModel/assigndata");

const getAllTask = async (req, res, next) => {
  try {
    const response = await Assigndata.findAll();
    res.status(200).json(response); 
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "Internal Server Error" }); 
  }
};

module.exports = getAllTask;
