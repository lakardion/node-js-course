const path = require('path')
const { rootDir } = require('../helpers/rootDir')
const fs = require('fs')

// const products = []
const p = path.join(rootDir, 'data', 'products.json')

const getProductsFromFile = (onResolve) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      onResolve([])
    } else {
      onResolve(JSON.parse(fileContent))
    }
  })
}

module.exports = class Product {
  constructor (t) {
    this.title = t
  }

  save () {
    getProductsFromFile(
      (products) => {
        const newProducts = [...products, this]
        fs.writeFile(p, JSON.stringify(newProducts), (err) => {
          console.log(err)
        })
      }
    )
  }

  static fetchAll (onResolve) {
    getProductsFromFile(onResolve)
  }
}
