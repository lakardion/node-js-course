const { Schema, model } = require('mongoose')

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
)

module.exports = model('Product', productSchema)

// const { ObjectId } = require("mongodb");
// const { getDb } = require("../util/database");

// exports.Product = class Product {
//   constructor({ title, price, description, imageUrl, userId, _id = undefined }) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl
//     this.userId = new ObjectId(userId)
//     this._id = _id ? new ObjectId(_id) : _id
//   }
//   async save() {
//     const collection = getCollection()
//     if (this._id) {
//       const { _id, ...rest } = this
//       return collection.updateOne({ _id: this._id }, { $set: { ...rest } })
//     }
//     try {
//       const inserted = await collection.insertOne(this)
//       return inserted

//     } catch (insertError) {
//       console.error({ insertError })
//     }
//   }
// }

// const getCollection = () => {
//   const COLLECTION_NAME = 'products'
//   const db = getDb()
//   const collection = db.collection(COLLECTION_NAME)
//   return collection
// }

// exports.ProductRepository = class ProductRepository {
//   static findById(id) {
//     const collection = getCollection()
//     const _id = typeof (id) === 'string' ? new ObjectId(id) : id
//     return collection.findOne({ _id })
//   }
//   static deleteById(id) {
//     const _id = new ObjectId(id)
//     const collection = getCollection()
//     return collection.deleteOne({ _id })
//   }

//   static fetchAll() {
//     const collection = getCollection()
//     try {
//       //TODO: implement pagination of this information
//       //return everything, everywhere, all at once.
//       return collection.find().toArray()

//     } catch (fetchAllError) {
//       console.error({ fetchAllError })
//     }
//   }
// }
