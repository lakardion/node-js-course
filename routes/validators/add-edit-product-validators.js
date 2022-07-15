import { check } from "express-validator";

export const addEditProductValidators = [
  check('title').isLength({ min: 0 }).withMessage('required'),
  check('imageUrl').isURL().withMessage('has to be a url').isLength({ min: 0 }).withMessage('required'),
  check('price').isNumeric().withMessage('has to be a number'),
  check('description').isLength({ max: 255 })
]