const Sequelize = require("sequelize");

const sequelize = new Sequelize("omrusermanagement", "root", "root", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;