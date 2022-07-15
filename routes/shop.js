import express from 'express'
import { isAuth } from '../middleware/is-auth.js'
import { shopController } from '../controllers/index.js'

const unauthedRouter = express.Router();
const authedRouter = express.Router()

// unauth routes
unauthedRouter.get("/", shopController.getIndex);
unauthedRouter.get("/products", shopController.getProducts);
unauthedRouter.get("/products/:productId", shopController.getProduct);

// auth routes
authedRouter.use(isAuth)
authedRouter.get("/cart", shopController.getCart);
authedRouter.post("/cart", shopController.postCart);
authedRouter.post("/cart-delete-item", shopController.postCartDeleteProduct);
authedRouter.post("/create-order", shopController.postOrder);
authedRouter.get("/orders", shopController.getOrders);

// router.get('/checkout', shopController.getCheckout);

export { unauthedRouter as shopUnauthedRouter, authedRouter as shopAuthedRouter }


