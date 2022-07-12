const CartRepository = require('../models/cart')
const { ProductRepository } = require('../models/product')

exports.getProducts = (req, res, next) => {
  ProductRepository.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    })
  })
}

exports.getProductById = (req, res, next) => {
  const { productId } = req.params
  ProductRepository.findById(productId, (product) => {
    res.render('shop/product-details', { product, pageTitle: `Details - ${product.title}`, path: '/products' })
  })
}

exports.getIndex = (req, res, next) => {
  ProductRepository.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    })
  })
}

exports.getCart = (req, res, next) => {
  CartRepository.getCart((cart) => {
    ProductRepository.fetchAll((products) => {
      const populatedProducts = cart.products.map(prod => {
        const foundProduct = products.find(p => p.id === prod.id)
        return ({ ...foundProduct, qty: prod.qty })
      })
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        cart: { ...cart, products: populatedProducts }
      })
    })
  })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId
  ProductRepository.findById(prodId, (prod) => {
    CartRepository.addToCart(prodId, prod.price)
    res.redirect('/')
  })
}

exports.postRemoveFromCart = (req, res, next) => {
  const prodId = req.body.productId
  CartRepository.removeFromCart(prodId, () => {
    res.redirect('/cart')
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  })
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  })
}
