const Sequelize = require("sequelize");

const sequelize = new Sequelize("omrscanner", "root", "root", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;

// const Sequelize = require("sequelize");

// const sequelize = new Sequelize("omrscanner", "root", "root", {
//   dialect: "mysql",
//   host: "localhost",
// });

// module.exports = sequelize;
