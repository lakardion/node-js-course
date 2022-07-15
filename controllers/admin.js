import { validationResult } from 'express-validator';
import { Product } from '../models/index.js'
import { deleteFile } from '../util/file.js';

const ITEMS_PER_PAGE = 2

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
  // multer in action
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)
  if (!image) {
    return res.status(422).render(
      "admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      oldData: { title, price, description },
      errorMessage: 'File upload is required to add a product. Only valid files are images (png,jpg, jpeg)',
      validationErrors: [],
      successMessage: ''
    })
  }
  if (!errors.isEmpty()) {
    return res.render(
      "admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      oldData: { title, price, description },
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
  const imageUrl = image.path
  try {
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
  } catch (productSaveError) {
    console.error({ productSaveError })
    return res.status(500).render(
      "admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      oldData: { title, price, description },
      errorMessage: 'Database operation failed. Please try again later',
      validationErrors: [],
      successMessage: ''
    })
  }
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
  const { productId: id, title, price, image, description } = req.body;
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
      oldData: { title, price, description },
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
  if (image) {
    deleteFile(product.imageUrl)
    product.imageUrl = image.path
  }
  product.description = description;
  await product.save();
  res.redirect("/admin/products");
};

export const getProducts = async (req, res, next) => {
  const { page } = req.query
  const countDocuments = await Product.countDocuments({ userId: req.user._id })
  const totalPages = Math.ceil(countDocuments / ITEMS_PER_PAGE)
  const products = await Product.find({ userId: req.user._id }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
  // .select('title price -_id')
  // we could use select to only get certain data, this by specifying the fields space separated in a string
  // .populate('userId')
  // we could use populate to get embedded documentts
  res.render("admin/products", {
    prods: products,
    pageTitle: "Admin Products",
    path: "/admin/products",
    totalPages
    , currentPage: page ?? 1
  });
};

export const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    if (!productId) return res.status(400).json({ message: 'No id was passed' })
    const product = await Product.findOne({ _id: productId, userId: req.user._id })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    deleteFile(product.imageUrl)
    await product.delete()
    res.status(204).json()
  } catch (deleteError) {
    res.status(500).json({ message: 'Deleting product failed' })
  }
};
