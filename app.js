const express = require("express");
const { sequelize } = require("./models");

const app = express();
app.use(express.json());

app.listen({ port: 5000 }, async () => {
  console.log("Sever Up on http://localhost:5000");
  await sequelize.authenticate();
  console.log("Database connected!");
});
