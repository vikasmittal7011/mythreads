import { validationResult } from "express-validator";
import HttpError from "../modals/http-error.js";
import { Post } from "../modals/Post.js";

const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages, 422));
  }
  try {
    const id = req.id;

    const post = new Post({ ...req.body, postedBy: id });

    await post.save();

    if (!post)
      return next(new HttpError("Connot able to add post try again", 400));

    res.json({ success: true, post });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

export { createPost };
