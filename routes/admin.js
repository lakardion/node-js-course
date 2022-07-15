import express from 'express'

import { adminController } from '../controllers/index.js'
import { isAuth } from '../middleware/is-auth.js'
import { addEditProductValidators } from './validators/index.js';

const router = express.Router();

router.use(isAuth)

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProduct);

// /admin/products => GET
router.get("/products", adminController.getProducts);

// /admin/add-product => POST
router.post("/add-product", addEditProductValidators, adminController.postAddProduct);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", addEditProductValidators, adminController.postEditProduct);

router.post("/delete-product", adminController.postDeleteProduct);

export { router as adminRouter }