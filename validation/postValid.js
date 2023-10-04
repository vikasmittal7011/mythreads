import { check } from "express-validator";

export const createPostsValiation = [
  check("text")
    .not()
    .isEmpty()
    .isLength({ min: 8, max: 500 })
    .withMessage("Enter something about post"),
];

export const createRepliesValiation = [
  check("text")
    .not()
    .isEmpty()
    .isLength({ min: 8, max: 150 })
    .withMessage("Enter something about post"),
];
