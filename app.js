// ? Even though dotenv was at the top of the file (import dotenv from 'dotenv'; dotenv.config()). The env file was loaded after my modules rather so I was getting undefined on my controllers where the env variables whee used
import 'dotenv/config'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import session from 'express-session'
import MongoDBStoreSession from 'connect-mongodb-session'
import csrf from 'csurf'
import flash from 'connect-flash'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

import { errorController } from './controllers/index.js'
import { adminRouter, shopAuthedRouter, shopUnauthedRouter, authRouter } from './routes/index.js'
import { User } from './models/index.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MongoDBStore = MongoDBStoreSession(session)

const { MONGO_DB_URI } = process.env
const log = (color, message) => {
  if (typeof (message) === 'function') throw new Error('functions are not supported as message')
  const parsedMessage = typeof (message) === 'object' ? JSON.stringify(message, undefined, 2) : message
  return console.debug(chalk[color](parsedMessage));
}

const store = new MongoDBStore({
  uri: MONGO_DB_URI,
  collection: 'sessions'
})


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
  try {
    const user = await User.findById(req.session.user._id)
    if (user) req.user = user;
    next()
  }
  catch (findUserError) {
    const error = new Error('Error trying to get user information')
    error.httpStatusCode = 500;
    next(error)
  }
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use(authRouter);
app.use("/admin", adminRouter);
app.use(shopUnauthedRouter)
app.use(shopAuthedRouter);

app.use(errorController.get404);
app.get('/500', errorController.get500)

app.use((error, req, res, next) => {
  if (error) return res.redirect('/500')
  next()
})

  (async () => {
    try {
      await mongoose.connect(
        MONGO_DB_URI
      );
      log('green', 'DB connected')
      log('blue', 'Starting app...')
      // await (new User({ email: 'lakardion@test.com', username: 'Lakardion' }).save())
      app.listen(process.env.PORT);
      log('green', `App started in port ${process.env.PORT}`)
    } catch (connectionError) {
      log('red', { connectionError })
    }
  })();
