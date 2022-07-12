const fs = require('fs')
const path = require('path')

const p = path.join(
  path.dirname(require.main.filename),
  'data',
  'products.json'
)

const getProductsFromFile = onResolve => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      onResolve([])
    } else {
      onResolve(JSON.parse(fileContent))
    }
  })
}

const overwriteProducts = (products) => {
  fs.writeFile(p, JSON.stringify(products), console.error)
}

exports.ProductRepository = class ProductRepository {
  static delete (productId, onResolve) {
    getProductsFromFile(products => {
      const filtered = products.filter(p => p.id !== productId)
      overwriteProducts(filtered)
      onResolve()
    })
  }

  static update (product) {
    getProductsFromFile(products => {
      const copy = [...products]
      const idx = products.findIndex(p => p.id === product.id)
      if (idx === -1) {
        throw new Error('The product you tried to update does not exist')
      }
      copy[idx] = product
      overwriteProducts(copy)
    })
  }

  static fetchAll (cb) {
    getProductsFromFile(cb)
  }

  static findById (id, onResolve) {
    getProductsFromFile((products) => {
      const product = products.find(p => p.id === id)
      onResolve(product)
    })
  }
}

exports.Product = class Product {
  constructor (title, imageUrl, description, price) {
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  save () {
    this.id = Math.random().toString()
    getProductsFromFile(products => {
      products.push(this)
      overwriteProducts(products)
    })
  }
}
