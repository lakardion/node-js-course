const Product = require('../models/product');
const Cart = require('../models/cart');
exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId).then((product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = async (req, res, next) => {
  const cart = await req.user.getCart()
  const products = await cart.getProducts()
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart',
    products
  });
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  const cart = await req.user.getCart()
  // Get the products from the cart and see if we find the one with the given id, if not find it on the product table. One way or another we should get a product out of this line
  const cartProducts = await cart.getProducts({ where: { id: prodId } })
  // Im proud of this but I think is a bit misleading when being read. There is a type-safety issue where the product can be two different types: A standalone product , or a cart-related product. Both hold different fields (ig cart-related product has a cartItem field)
  const [product] = cartProducts?.length ? cartProducts : [await Product.findByPk(prodId)]
  const newQty = product?.cartItem ? product.cartItem.quantity + 1 : 1
  //? so it looks like this product is not an ordinary product but a product that is aware that it is related to the cart (bc we fetched it from the cart itself)
  await cart.addProduct(product, { through: { quantity: newQty } })
  //? what to do if the product already exists? We need some sort of update
  return res.redirect('/cart')
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;

  const cart = await req.user.getCart();
  //this where condition does a shallow equality looks like. prodId is a string and still is parsed as number and compared to the id which is an integer
  const [product] = await cart.getProducts({
    where: {
      id: prodId
    }
  })
  if (!product) return res.redirect('/cart')
  try {
    await product.cartItem.destroy()
  } catch (destroyErr) {
    console.error({ destroyErr })
  }
  return res.redirect('/cart')
};

exports.postOrder = async (req, res, next) => {
  const cart = await req.user.getCart()
  const products = await cart.getProducts()
  const order = await req.user.createOrder()
  const added = await order.addProducts(products.map(p => {
    // tried to do this in an immutable way but the p object has so many fields that throws stack overflow when trying to shallow copy the object
    p.orderItem = { quantity: p.cartItem.quantity }
    return p
  }))
  await cart.setProducts(null)
  return res.redirect('/orders')
}

exports.getOrders = async (req, res, next) => {
  const orders = await req.user.getOrders({ include: ['products'] })
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
