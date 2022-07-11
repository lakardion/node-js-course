const express = require("express");
const router = express.Router();
const path = require("path");
const { rootDir } = require("../helpers/rootDir");
const { products } = require("./admin");

router.get("/", (req, res, next) => {
  console.log({ products });
  res.sendFile(path.join(rootDir, "views", "shop.html"));
});

module.exports = router;
