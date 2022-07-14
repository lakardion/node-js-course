const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const unauthedRouter = express.Router();
const authedRouter = express.Router()

// unauth routes
unauthedRouter.get("/", shopController.getIndex);
unauthedRouter.get("/products", shopController.getProducts);
unauthedRouter.get("/products/:productId", shopController.getProduct);
exports.shopUnauthedRouter = unauthedRouter;

// auth routes
authedRouter.use(isAuth)
authedRouter.get("/cart", shopController.getCart);
authedRouter.post("/cart", shopController.postCart);
authedRouter.post("/cart-delete-item", shopController.postCartDeleteProduct);
authedRouter.post("/create-order", shopController.postOrder);
authedRouter.get("/orders", shopController.getOrders);

// router.get('/checkout', shopController.getCheckout);
exports.shopAuthedRouter = authedRouter


