const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const MONGO_DB_CONNSTRING = "mongodb+srv://root:mongodb@cluster0.5zaox.mongodb.net/shop?retryWrites=true&w=majority"

const store = new MongoDBStore({
  uri: MONGO_DB_CONNSTRING,
  collection: 'sessions'
})

const errorController = require("./controllers/error");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require('./models/user')

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: false, store }))

app.use(async (req, res, next) => {
  if (!req.session.user) return next()
  const user = await User.findById(req.session.user._id)
  req.user = user;
  next()
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

(async () => {
  try {
    await mongoose.connect(
      MONGO_DB_CONNSTRING
    );
    // await (new User({ email: 'lakardion@test.com', username: 'Lakardion' }).save())
    app.listen(3000);
  } catch (connectionError) {
    console.error({ connectionError });
  }
})();
