import express from "express";

const cors = require("cors");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT ?? 3000;

const app = express();

app.post("/login", (req, res) => {
  console.log("HOLA");
  // res.send('<h1>hola</h1>')
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
