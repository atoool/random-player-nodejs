/* eslint-disable quotes */

const express = require("express");
const cors = require("cors");
const open = require("open");
const router = require("./lib");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.use("/api/", router);

app.listen(port, function () {
  console.log("Server started on port", port);
  open("http://localhost:" + port + "/api/vid/", { app: "google chrome" });
});
