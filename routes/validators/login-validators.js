import { check } from "express-validator";

export const loginValidators = [
  check('email').isEmail().withMessage('invalid email').normalizeEmail().trim(),
  check('password').isLength({ min: 5 }).isAlphanumeric().withMessage('password should be alphanumeric and at least 5 characters long').custom(async (value, { req }) => {
    // todo: check with bcrypt and database
  }),
] 