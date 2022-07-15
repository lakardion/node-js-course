import mongoose from "mongoose";
const { Schema, model } = mongoose

const orderSchema = new Schema({
  user: {
    email: {
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

export const Order = model("Order", orderSchema);
