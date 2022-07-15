import express from 'express'
import { authController } from '../controllers/index.js'
import { signUpValidators, loginValidators } from './validators/index.js';

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", loginValidators, authController.postLogin)
router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup);
router.post('/signup', signUpValidators, authController.postSignup);

router.get('/reset', authController.getReset)
router.post('/reset', authController.postReset)
router.post('/reset-password', authController.postResetPassword)

export { router as authRouter }
