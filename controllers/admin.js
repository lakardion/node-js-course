const { Product, ProductRepository } = require('../models/product')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    product: {
      title: '', price: 0, description: '', imageUrl: ''
    },
    editing: ''
  })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect('/')
  }
  const prodId = req.params.productId
  ProductRepository.findById(prodId, (product) => {
    if (!product) return res.redirect('/')
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product
    })
  })
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description
  const product = new Product(title, imageUrl, description, price)
  product.save()
  res.redirect('/')
}

// This should be a put... but whatever html
exports.postEditProduct = (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description
  const product = new Product(title, imageUrl, description, price)
  product.id = req.params.productId
  ProductRepository.update(product)
  res.redirect('/admin')
}

exports.getProducts = (req, res, next) => {
  ProductRepository.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    })
  })
}

exports.deleteProduct = (req, res, next) => {
  const { productId } = req.params
  ProductRepository.delete(productId, () => {
    res.redirect('/admin/products')
  })
}
