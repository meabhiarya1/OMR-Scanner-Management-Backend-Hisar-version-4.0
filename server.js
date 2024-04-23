const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./utils/database");
// const bodyParser = require("body-parser");
const userRoutes = require('./routes/Omr');
const compareCsv = require("./routes/compareCsv")
const PORT = 5000;
app.use(cors())

app.use(express.json());

app.use("/users", userRoutes);
app.use(compareCsv)
db
  .sync({ force: false })
  .then(() => {
    console.log("Database is connected");
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
})
.catch((err) => {
  console.error("Unable to connect to the database:", err);
});
