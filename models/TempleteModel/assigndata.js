const Sequelize = require("sequelize");

const sequelize = require("../../utils/database");

const Assigndata = sequelize.define("assigndata", {
  userId: {
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

  blankTaskStatus: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },

  multTaskStatus: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },

  taskStatus: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },

  moduleType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  errorFilePath: {
    type: Sequelize.STRING,
  },
  correctedCsvFilePath: {
    type: Sequelize.STRING,
  },
  imageDirectoryPath: {
    type: Sequelize.STRING,
  },
  currentIndex: {
    type: Sequelize.INTEGER,
  },

  templeteId: {
    type: Sequelize.INTEGER,
    // allowNull: false,
    references: {
      model: "templetes", // 'Templete' refers to the table name
      key: "id",
    },
  },
});

module.exports = Assigndata;
