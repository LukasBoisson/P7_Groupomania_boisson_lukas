const express = require("express");
const path = require("path");
const helmet = require("helmet");
const db = require("./config/database");

const app = express();

// add headers for requests
app.use((req, res, next) => {
  // access the API from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  // add the mentioned headers to the requests sent to the API
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  //send requests with the mentioned methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
