require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);
const { conect } = require("./utils/DBConnection");
conect();

const userRoutes = require("./routes/userRoutes");
app.use("/auth", userRoutes);

app.listen(5000, () => {
  console.log(`server is running `);
});
