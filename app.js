const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const { mongoConnect } = require('./util/database');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { UserRepository, User } = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(async (req, res, next) => {
  const user = await UserRepository.findById('62cee713aa257c93061e2cbb')
  const { email, name, cart, _id } = user
  req.user = new User({ name, email, cart, _id })
  next()
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

; (async () => {
  try {
    await mongoConnect()
    // await (new User({ email: 'lakardion@test.com', username: 'Lakardion' }).save())
    app.listen(3000)
  } catch (connetionError) {
    console.error({ connectionError })
  }
})()
