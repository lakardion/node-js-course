import { Product, Order } from "../models/index.js";

export const getProducts = async (req, res, next) => {
  const products = await Product.find();
  res.render("shop/product-list", {
    prods: products,
    pageTitle: "All Products",
    path: "/products",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken()
  });
};

export const getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  res.render("shop/product-detail", {
    product,
    pageTitle: product.title,
    path: "/products",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken()
  });
};

export const getIndex = async (req, res, next) => {
  const products = await Product.find();
  res.render("shop/index", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken()
  });
};

export const getCart = async (req, res, next) => {
  const user = await req.user.populate("cart.items.productId");
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart",
    products: user.cart.items,
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken()
  });
};

export const postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = await Product.findById(prodId);
  await req.user.addToCart(product);
  return res.redirect("/cart");
};

export const postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  await req.user.removeFromCart(prodId);
  return res.redirect("/cart");
};

export const postOrder = async (req, res, next) => {
  const products = (await req.user.populate("cart.items.productId")).cart.items;
  const order = new Order({
    user: {
      email: req.user.email,
      userId: req.user._id,
    },
    products: products.map((i) => ({
      // in here we could also do { ...i.product.id._doc } which is a special field that mongoose provides so that we can get all the metadata of the reference of that document. However in my case I chose to do a population sf that information whenever the order gets fetched
      productData: i.productId,
      quantity: i.quantity,
    })),
  });
  await order.save();
  // we can also create a custom function for the user schema that executes this, I just liked this way which is a two-liner and it's the only place where we're using it right now
  req.user.cart.items = [];
  await req.user.save();
  return res.redirect("/orders");
};

export const getOrders = async (req, res, next) => {
  const orders = await Order.find({ "user.userId": req.user._id }).populate({
    path: "products",
    populate: {
      path: "productData",
      model: "Product",
    },
  });
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
    orders,
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken()
  });
};