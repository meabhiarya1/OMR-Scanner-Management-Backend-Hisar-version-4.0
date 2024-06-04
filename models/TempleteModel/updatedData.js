const Sequelize = require("sequelize");

const sequelize = require("../../utils/database");

const UpdatedDetails = sequelize.define("updatedDetails", {
  updatedColumn: {
    type: Sequelize.STRING,
  },
  previousData: {
    type: Sequelize.STRING,
  },
  currentData: {
    type: Sequelize.STRING,
  },

  rowIndex: {
    type: Sequelize.STRING,
  },

  fileId: {
    type: Sequelize.STRING,
  },
});

module.exports = UpdatedDetails;
