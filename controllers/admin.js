const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
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

exports.getEditProduct = async (req, res, next) => {
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
    product: product,
  });
};

exports.postEditProduct = async (req, res, next) => {
  const { productId: id, title, price, imageUrl, description } = req.body;
  const product = await Product.findById(id);
  product.title = title;
  product.price = price;
  product.imageUrl = imageUrl;
  product.description = description;
  await product.save();
  res.redirect("/admin/products");
  //? alternative with `where` clause
  // Product.update({ title, price, imageUrl, description }, {
  //   where: {
  //     id
  //   }
  // }).then(updatedIds => {
  // }).catch(console.error)
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.find();
  // .select('title price -_id')
  // we could use select to only get certain data, this by specifying the fields space separated in a string
  // .populate('userId')
  //we could use populate to get embedded documentts
  res.render("admin/products", {
    prods: products,
    pageTitle: "Admin Products",
    path: "/admin/products",
  });
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  await Product.findByIdAndRemove(prodId);
  res.redirect("/admin/products");
};

//   //? alternative: this is if you want to use `where` clause
//   // Product.destroy({
//   //   where: {
//   //     id: prodId
//   //   }
//   // }).then(destroyedCount => {
//   //   res.redirect('/admin/products')
//   // }).catch(console.error)
// };
