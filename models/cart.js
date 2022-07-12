const fs = require('fs')
const path = require('path')
// Each product in cart will have: product,quantity
const p = path.join(
  path.dirname(require.main.filename),
  'data',
  'cart.json'
)

module.exports = class CartRepository {
  static save (cart) {
    fs.writeFile(p, JSON.stringify(cart), (err) => {
      if (err) console.error(err)
    })
  }

  static addToCart (id, productPrice) {
    const price = parseFloat(productPrice)
    fs.readFile(p, (err, fileContent) => {
      if (!err) {
        let newCart
        const dbCart = JSON.parse(fileContent)
        const totalPrice = parseFloat(dbCart.totalPrice)
        const existingIdx = dbCart.products.findIndex(prodItem => prodItem.id === id)
        if (existingIdx === -1) {
          const newCartProducts = [...dbCart.products, { id, qty: 1, price }]
          const newPrice = totalPrice + price
          newCart = { products: newCartProducts, totalPrice: newPrice }
        } else {
          const cartProductsCopy = [...dbCart.products]
          const existingProduct = dbCart.products[existingIdx]
          const updatedProduct = { ...existingProduct, qty: existingProduct.qty + 1 }
          cartProductsCopy[existingIdx] = updatedProduct
          newCart = { products: cartProductsCopy, totalPrice: totalPrice + price }
        }
        this.save(newCart)
        return
      }
      console.error(err)
      const newCart = { products: [{ id, price, qty: 1 }], totalPrice: price }
      this.save(newCart)
    })
  }

  static removeFromCart (productId, onResolve) {
    this.getCart((cart) => {
      const copy = [...cart.products]
      const foundIdx = cart.products.findIndex(p => p.id === productId)
      if (foundIdx === -1) return
      const [removed] = copy.splice(foundIdx, 1)
      fs.writeFile(p, JSON.stringify({ products: copy, totalPrice: cart.totalPrice - (removed.price * removed.qty) }), console.error)
      onResolve()
    })
  }

  static getCart (onResolve) {
    fs.readFile(p, (err, fileContent) => {
      if (!err) {
        onResolve(JSON.parse(fileContent))
      } else {
        onResolve([])
      }
    })
  }
}
