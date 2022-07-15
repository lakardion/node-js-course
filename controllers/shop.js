import { createReadStream, createWriteStream, readFile } from "fs";
import path from "path";
import { Product, Order } from "../models/index.js";
import PDFDocument from 'pdfkit'

const ITEMS_PER_PAGE = 2

export const getProducts = async (req, res, next) => {
  const { page } = req.query
  const countDocuments = await Product.countDocuments()
  const totalPages = Math.ceil(countDocuments / ITEMS_PER_PAGE)
  const products = await Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
  res.render("shop/product-list", {
    prods: products,
    pageTitle: "All Products",
    path: "/products",
    totalPages,
    currentPage: page ?? 1
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
  const { page } = req.query
  const countDocuments = await Product.countDocuments()
  const totalPages = Math.ceil(countDocuments / ITEMS_PER_PAGE)
  const products = await Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
  res.render("shop/index", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    totalPages,
    currentPage: page ?? 1
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
      productData: { ...i.productId._doc },
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
  const orders = await Order.find({ "user.userId": req.user._id });
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
    orders,
  });
};

export const getInvoice = async (req, res, next) => {
  const { orderId } = req.params
  const order = await Order.findById(orderId)
  if (!order) {
    return next(new Error('Order not found'))
  }
  if ((order.user.userId.toString()) !== req.user._id.toString()) {
    return next(new Error('Unauthorized'))
  }

  const invoiceName = `invoice-${orderId}.pdf`
  const invoicePath = path.join('data', 'invoices', invoiceName)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)

  const pdfDoc = new PDFDocument()
  pdfDoc.pipe(createWriteStream(invoicePath))
  pdfDoc.pipe(res)

  pdfDoc.fontSize(25).text('Invoice', { underline: true })
  pdfDoc.text('----------------------------------')
  let totalPrice = 0
  order.products.forEach(p => {
    totalPrice += p.quantity * p.productData.price
    pdfDoc.text(`${p.quantity}    ${p.productData.title}    ${p.productData.price}    $${p.productData.price * p.quantity}`)
  })
  pdfDoc.text('----------------------------------')
  pdfDoc.text(`Total price: $ ${totalPrice}`)
  pdfDoc.end()
  // With local file
  // readFile(invoicePath, (err, data) => {
  //   if (err) {
  //     console.error({ err })
  //     return next(err)
  //   }
  //   res.setHeader('Content-Type', 'application/pdf')
  //   res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)
  //   res.send(data)
  // })
  // const stream = createReadStream(invoicePath)
  // stream.pipe(res)
}