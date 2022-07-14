const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  user: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  products: [
    {
      productData: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

module.exports = model("Order", orderSchema);
