import { check } from "express-validator";

export const createPostsValiation = [
  check("text")
    .not()
    .isEmpty()
    .isLength({ min: 8, max: 500 })
    .withMessage("Entered text must be greater then 8 char"),
];

export const createRepliesValiation = [
  check("text")
    .not()
    .isEmpty()
    .isLength({ min: 8, max: 150 })
    .withMessage("Entered text must be greater then 8 char"),
];
