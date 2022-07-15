import { validationResult } from 'express-validator';
import { Product } from '../models/index.js'

export const getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: '',
    successMessage: '',
    oldData: undefined,
    validationErrors: []
  });
};

export const postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render(
      "admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      oldData: { title, imageUrl, price, description },
      errorMessage: errors.array().reduce((result, err, idx, arr) => {
        if (idx === 0) result += 'Error with the following fields: '
        result += `${err.param} (${err.msg})`
        if (idx !== arr.length - 1) result += ', '
        return result
      }, ''),
      validationErrors: errors.array(),
      successMessage: ''
    }
    )
  }
  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
    // userId: req.user._id
  });
  await product.save();
  res.redirect("/admin/products");
};

export const getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  if (!product) {
    return res.redirect("/");
  }
  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    editing: editMode,
    product,
    errorMessage: undefined,
    oldData: undefined,
    validationErrors: [],
    successMessage: ''
  });
};

export const postEditProduct = async (req, res, next) => {
  const { productId: id, title, price, imageUrl, description } = req.body;
  const product = await Product.findById(id);
  if (product.userId.toString() !== req.user._id.toString()) {
    return res.redirect('/')
  }
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render(
      "admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product,
      oldData: { title, imageUrl, price, description },
      errorMessage: errors.array().reduce((result, err, idx, arr) => {
        if (idx === 0) result += 'Error with the following fields: '
        result += `${err.param} (${err.msg})`
        if (idx !== arr.length - 1) result += ', '
        return result
      }, ''),
      validationErrors: errors.array(),
      successMessage: ''
    }
    )
  }
  product.title = title;
  product.price = price;
  product.imageUrl = imageUrl;
  product.description = description;
  await product.save();
  res.redirect("/admin/products");
};

export const getProducts = async (req, res, next) => {
  const products = await Product.find({ userId: req.user._id });
  // .select('title price -_id')
  // we could use select to only get certain data, this by specifying the fields space separated in a string
  // .populate('userId')
  // we could use populate to get embedded documentts
  res.render("admin/products", {
    prods: products,
    pageTitle: "Admin Products",
    path: "/admin/products",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken()
  });
};

export const postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  await Product.deleteOne({ _id: prodId, userId: req.user._id });
  res.redirect("/admin/products");
};
