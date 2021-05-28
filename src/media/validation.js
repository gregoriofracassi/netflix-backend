import { body } from "express-validator"

export const bodyValidator = [
  body("title").exists().withMessage("theres no title"),
  body("year").exists().withMessage("theres no category"),
  body("type").exists().withMessage("please add the type of media"),
]
