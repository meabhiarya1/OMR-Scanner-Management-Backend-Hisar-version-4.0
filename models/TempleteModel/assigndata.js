const Sequelize = require("sequelize");

const sequelize = require("../../utils/database");

const Assigndata = sequelize.define("assigndata", {
  // id: {
  //   type: Sequelize.INTEGER,
  //   autoIncrement: true,
  //   allowNull: false,
  //   primaryKey: true,
  // },
  userId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  templeteId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fileId: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  max: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  min: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  taskStatus: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },

  allDataIndex: {
    type: Sequelize.STRING,
  },

  multDataIndex: {
    type: Sequelize.STRING,
  },

  blankDataIndex: {
    type: Sequelize.STRING,
  },

  multAndBlankDataIndex: {
    type: Sequelize.STRING,
  },

  moduleType: {
    type: Sequelize.STRING,
    allowNull: false
  },
  errorFilePath: {
    type: Sequelize.STRING,
  },
  correctedCsvFilePath: {
    type: Sequelize.STRING
  },
  imageDirectoryPath :{
    type: Sequelize.STRING
  }
});

module.exports = Assigndata;
