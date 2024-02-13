require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.static("dist"));

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is listening for incoming requests!");
});
