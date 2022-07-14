const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String, required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const existingIdx = this.cart.items.findIndex(
    (p) => p.productId.toString() === product._id.toString()
  );
  if (existingIdx !== -1) {
    const existing = this.cart.items[existingIdx];
    existing.quantity += 1;
  } else {
    this.cart.items.push({ productId: product._id, quantity: 1 });
  }
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  // ? I did this becuase is quite confusing whether the id is an object id or a string
  this.cart.items = this.cart.items.filter(
    (ci) => ci.productId.toString() !== productId.toString()
  );
  this.save();
};

module.exports = model("User", userSchema);
// const { ObjectId } = require("mongodb")
// const { getDb } = require("../util/database")
// const { ProductRepository } = require("./product")

// const getCollection = () => {
//   const USERS_COLLECTION = 'users'
//   const db = getDb()
//   const collection = db.collection(USERS_COLLECTION)
//   return collection
// }
// exports.User = class User {
//   constructor({ name, email, cart = [], _id = undefined }) {
//     this.name = name
//     this.email = email
//     /**
//      * @type {Array<{ productId:string,quantity:number }>}
//      */
//     this.cart = cart
//     this._id = typeof (_id) === 'string' ? new ObjectId(_id) : _id
//   }
//   async save() {
//     const collection = getCollection()
//     const inserted = await collection.insertOne(this)
//     return inserted
//   }

//   async getCart() {
//     const productsPromise = this.cart.map(async ci => {
//       const product = await ProductRepository.findById(ci.productId)
//       return ({ cartItem: { quantity: ci.quantity, productId: ci.productId, title: product.title } });
//     })
//     /**
//      * @type {{cartItem:{quantity:number,productId:string,title:string}}[]}
//      */
//     const cart = await Promise.all(productsPromise)
//     return cart
//   }

//   addToCart(productId) {
//     const collection = getCollection()
//     const existingIdx = this.cart.findIndex(p => p.productId === productId.toString())
//     if (existingIdx !== -1) {
//       const existing = this.cart[existingIdx]
//       existing.quantity += 1
//       return collection.updateOne({ _id: this._id }, { $set: { cart: this.cart } })
//     }
//     this.cart.push({ productId, quantity: 1 })
//     return collection.updateOne({ _id: this._id }, { $set: { cart: this.cart } })
//   }

//   removeFromCart(productId) {
//     const collection = getCollection()
//     //? I did this becuase is quite confusing whether the id is an object id or a string
//     this.cart = this.cart.filter(ci => ci.productId.toString() !== productId.toString())
//     return collection.updateOne({ _id: this._id }, { $set: { cart: this.cart } })
//   }
//   async addOrder() {
//     const db = getDb()
//     const ordersCollection = db.collection('orders')
//     const inserted = await ordersCollection.insertOne({ products: (await this.getCart()).map(c => c.cartItem), user: { _id: this._id, name: this.name } })
//     this.cart = []
//     const collection = getCollection()
//     await collection.updateOne({ _id: this._id }, { $set: { cart: this.cart } })
//   }

//   getOrders() {
//     const db = getDb()
//     const ordersCollection = db.collection('orders')
//     return ordersCollection.find({ "user._id": this._id }).toArray()

//   }
// }

// exports.UserRepository = class UserRepository {
//   static findById(id) {
//     const collection = getCollection()
//     const _id = new ObjectId(id)
//     return collection.findOne({ _id })
//   }
// }
