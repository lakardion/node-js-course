const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
// const { UserRepository, User } = require('./models/user');
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(async (req, res, next) => {
  const user = await User.findById("62cf2e73908c74bdae5f86d6");
  req.user = user;
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

(async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://root:mongodb@cluster0.5zaox.mongodb.net/shop?retryWrites=true&w=majority"
    );
    // await (new User({ email: 'lakardion@test.com', username: 'Lakardion' }).save())
    app.listen(3000);
  } catch (connectionError) {
    console.error({ connectionError });
  }
})();
