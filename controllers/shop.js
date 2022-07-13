const { OrderRepository } = require('../models/order');
const { ProductRepository } = require('../models/product');
const { User } = require('../models/user');

exports.getProducts = async (req, res, next) => {
  const products = await ProductRepository.fetchAll()
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'All Products',
    path: '/products'
  });
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const product = await ProductRepository.findById(prodId)
  res.render('shop/product-detail', {
    product: product,
    pageTitle: product.title,
    path: '/products'
  });
};

exports.getIndex = async (req, res, next) => {
  const products = await ProductRepository.fetchAll()
  res.render('shop/index', {
    prods: products,
    pageTitle: 'Shop',
    path: '/'
  });
};

exports.getCart = async (req, res, next) => {
  const products = await req.user.getCart()
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart',
    products
  });
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  // I fear this is super prone to get outdated pretty easily
  await req.user.addToCart(prodId)
  return res.redirect('/cart')
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  await req.user.removeFromCart(prodId)
  return res.redirect('/cart')
};

exports.postOrder = async (req, res, next) => {
  await req.user.addOrder()
  return res.redirect('/orders')
}

exports.getOrders = async (req, res, next) => {
  const orders = await req.user.getOrders()
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders
  });
};

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };
