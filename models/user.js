import mongoose from "mongoose";
const { Schema, model } = mongoose
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
  resetToken: String,
  resetTokenExpiration: Date
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

export const User = model("User", userSchema);
