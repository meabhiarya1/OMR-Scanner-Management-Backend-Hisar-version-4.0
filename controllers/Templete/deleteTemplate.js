const Template = require("../../models/TempleteModel/templete");
const AssignData = require("../../models/TempleteModel/assigndata");

const deleteTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;

    // Find the template by primary key
    const template = await Template.findByPk(templateId);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Check if there are any AssignData records associated with this template
    const assignDataCount = await AssignData.findByPk(templateId);

    if (assignDataCount != null) {
      return res.status(400).json({
        error:
          "Template cannot be deleted as there are associated AssignData records",
      });
    }

    // Delete the template since there are no associated AssignData records
    await template.destroy();

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the template" });
  }
};

module.exports = deleteTemplate;
