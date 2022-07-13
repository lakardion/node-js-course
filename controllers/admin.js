const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  try {
    await req.user.createProduct({ description, imageUrl, price, imageUrl, title })
    console.log('Product created!');
    res.redirect(
      '/'
    )
  } catch (err) {
    console.error(err)
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  const product = await Product.findByPk(prodId)
  if (!product) {
    return res.redirect('/');
  }
  res.render('admin/edit-product', {
    pageTitle: 'Edit Product',
    path: '/admin/edit-product',
    editing: editMode,
    product: product
  });
};

exports.postEditProduct = async (req, res, next) => {
  const { productId: id, title, price, imageUrl, description } = req.body
  const product = await Product.findByPk(id)
  product.title = title;
  product.price = price
  product.imageUrl = imageUrl
  product.description = description
  await product.save()
  res.redirect('/admin/products');
  //? alternative with `where` clause
  // Product.update({ title, price, imageUrl, description }, {
  //   where: {
  //     id
  //   }
  // }).then(updatedIds => {
  // }).catch(console.error)
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.findAll()
  res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products'
  });
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = await Product.findByPk(prodId)
  await product.destroy()
  res.redirect('/admin/products')

  //? alternative: this is if you want to use `where` clause
  // Product.destroy({
  //   where: {
  //     id: prodId
  //   }
  // }).then(destroyedCount => {
  //   console.log('destroyed', destroyedCount)
  //   res.redirect('/admin/products')
  // }).catch(console.error)
};
