const Template = require("../../models/TempleteModel/templete");

const deleteTemplate = async (req, res) => {
  try {
    const templateId = req.body.templateId;

    // Find the template by primary key
    const template = await Template.findByPk(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Delete the template and cascade the deletion to related data
    await template.destroy();

    res.status(200).json({ message: 'Template Deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'An error occurred while deleting the template' });
  }
};

module.exports = deleteTemplate;
