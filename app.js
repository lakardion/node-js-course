// ? Even though dotenv was at the top of the file (import dotenv from 'dotenv'; dotenv.config()). The env file was loaded after my modules rather so I was getting undefined on my controllers where the env variables whee used
import bodyParser from 'body-parser'
import chalk from 'chalk'
import flash from 'connect-flash'
import MongoDBStoreSession from 'connect-mongodb-session'
import csrf from 'csurf'
import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

import compression from 'compression'
import { createWriteStream } from 'fs'
import helmet from 'helmet'
import morgan from 'morgan'
import multer from 'multer'
import { errorController } from './controllers/index.js'
import { User } from './models/index.js'
import { adminRouter, authRouter, shopAuthedRouter, shopUnauthedRouter } from './routes/index.js'

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`)
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg')
    cb(null, true)
  else cb(null, false)
}

//using SSL
// const privateKey = readFileSync('server.key')
// const certificate = readFileSync('server.cert')

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


const accessLogStream = createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

const app = express();
app.use(helmet())
app.use(compression())
app.use(morgan('combined', { stream: accessLogStream }))
const csrfProtection = csrf()

app.set("view engine", "ejs");
app.set("views", "views");

// ! super important the order of these 4 down here. csurf requires body parser to be able to get the _csrf value out of the hidden input, as well as the session set already so that it can use that as well..
app.use(multer({ storage: fileStorage, fileFilter }).single('image'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
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
  console.error(error)
  if (error) return res.redirect('/500')
  next()
})


  ; (async () => {
    try {
      await mongoose.connect(
        MONGO_DB_URI
      );
      log('green', 'DB connected')
      log('blue', 'Starting app...')
      // await (new User({ email: 'lakardion@test.com', username: 'Lakardion' }).save())
      // using SSL
      // https.createServer({
      //   key: privateKey,
      //   cert: certificate
      // }, app)
      //   .listen(process.env.PORT);
      app.listen(process.env.PORT, () => {
        log('green', `App started in port ${process.env.PORT}`)
      });
    } catch (connectionError) {
      log('red', { connectionError })
    }
  })();
