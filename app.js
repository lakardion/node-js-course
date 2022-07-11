const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const path = require("path");
const { rootDir } = require("./helpers/rootDir");

const app = express();
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use((req, res) => {
  res.status(404).sendFile(path.join(rootDir, "views", "not-found.html"));
});

app.listen(3000);
