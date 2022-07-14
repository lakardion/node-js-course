require('dotenv').config()
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const { MONGO_DB_URI } = process.env
const csrf = require('csurf')
const flash = require('connect-flash')

const store = new MongoDBStore({
  uri: MONGO_DB_URI,
  collection: 'sessions'
})

const errorController = require("./controllers/error");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require('./models/user')

const app = express();
const csrfProtection = csrf()

app.set("view engine", "ejs");
app.set("views", "views");

// ! super important the order of these 4 down here. csurf requires body parser to be able to get the _csrf value out of the hidden input, as well as the session set already so that it can use that as well..
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: false, store }))
app.use(csrfProtection)
app.use(flash())

app.use(async (req, res, next) => {
  if (!req.session.user) return next()
  const user = await User.findById(req.session.user._id)
  req.user = user;
  next()
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use(shopRoutes.shopUnauthedRouter)
app.use(shopRoutes.shopAuthedRouter);

app.use(errorController.get404);

(async () => {
  try {
    await mongoose.connect(
      MONGO_DB_URI
    );
    // await (new User({ email: 'lakardion@test.com', username: 'Lakardion' }).save())
    app.listen(3000);
  } catch (connectionError) {
    console.error({ connectionError });
  }
})();
