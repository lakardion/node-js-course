import { body, check } from "express-validator";
import { User } from "../../models/index.js";

export const signUpValidators = [
  check('email').isEmail().withMessage('Invalid email').custom(async (value, { req }) => {
    const user = await User.findOne({ email: value })
    if (user) {
      throw new Error('User already exists, please insert another email')
    }
    return true;
  }).normalizeEmail().trim(),
  body('password', 'Password must be at least 5 characters long and alpha numeric').isLength({ min: 5 }).isAlphanumeric(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match')
    }
    return true
  })
]