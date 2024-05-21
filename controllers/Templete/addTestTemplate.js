const Templete = require("../../models/TempleteModel/templete");
const MetaData = require("../../models/TempleteModel/metadata");

const addTestTemplete = async (req, res, next) => {
  const { templates } = req.body; // Modify the structure of the request body
console.log(templates,">>>>>>>>>>>>>>>>>>>>>")
  try {
    // Iterate over each template data
    await Promise.all(
      templates.map(async (templateData) => {
        const templeteResult = await Templete.create({
          name: templateData.name,
          TempleteType: "Data Entry",
        });

        if (!templeteResult) {
          throw new Error("Failed to create template");
        }

        // Iterate over metadata for each template
        await Promise.all(
          templateData?.metaData?.map(async (current) => {
            await MetaData.create({
              attribute: current.attribute,
              coordinateX: current.coordinateX,
              coordinateY: current.coordinateY,
              width: current.width,
              height: current.height,
              fieldType: current.fieldType,
              pageNo: current.pageNo,
              templeteId: templeteResult.id, // Use the same template ID for all metadata items
            });
          })
        );
      })
    );

    res.status(200).json({ message: "Created Successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = addTestTemplete;
