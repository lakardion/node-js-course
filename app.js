const path = require('path');
const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

/**
 * Attach user sequelize obj to the request
 */
app.use(async (req, res, next) => {
  const user = await User.findByPk(1)
  req.user = user;
  next()
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Product);
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User)
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

//sync models

// sequelize.sync().then(result => {
//   console.log('Sync complete')
//   app.listen(3000)
//   return User.findByPk(1)
// }).then(user => {
//   if (!user) {
//     return User.create({ name: 'Lakardion', email: 'lakardion@test.com' })
//   }
//   return user
// }).then(user => {
//   console.log('user obtained')
// }).catch(err => {
//   console.log('hello what is going on ??', err)
// })

//iife alternative with async await
(async () => {
  try {
    const result = await sequelize.sync()
  }
  catch (syncError) {
    console.error({ syncError })
  }
  try {
    let user = await User.findByPk(1)
    if (!user) {
      user = await User.create({ name: 'Lakardion', email: 'lakardion@test.com' })
    }
    //? Why should I have to do this if from the relations I already declare that there should only be one cart per user
    const cart = await user.getCart()
    !cart && await user.createCart()
    console.log('user obtained')
  }
  catch (createError) {
    console.error({ userCreateError: createError })
  }
  app.listen(3000)
})()

