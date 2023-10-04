import { validationResult } from "express-validator";
import HttpError from "../modals/http-error.js";
import { Post } from "../modals/Post.js";

const getPost = async (req, res, next) => {
  try {
    const { _id } = req.params;

    const post = await Post.findById({ _id }).populate({
      path: "postedBy",
      select: "name username image",
    });

    if (!post) return next(new HttpError("Post not found", 404));

    res.json({ success: true, post });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

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

const likeAndUnlike = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const id = req.id;

    const post = await Post.findById({ _id });

    if (!post) return next(new HttpError("Post not found", 404));

    const isLikes = post.likes.includes(req.id);

    if (isLikes) {
      await Post.findByIdAndUpdate({ _id }, { $pull: { likes: id } });
      res.json({ message: "Post unlike successfully", success: true });
    } else {
      await Post.findByIdAndUpdate({ _id }, { $push: { likes: id } });
      res.json({ message: "Post like successfully", success: true });
    }

    res.json({ success: true, post });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const replies = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages, 422));
  }
  try {
    const { _id } = req.params;
    const userId = req.id;
    const text = req.body.text;

    const replie = { userId, text };

    const post = await Post.findById({ _id });

    if (!post) return next(new HttpError("Post not found", 404));

    const allReplies = [replie, ...post.replies];

    console.log({ replies: allReplies });

    const updatePost = await Post.findByIdAndUpdate(
      { _id },
      { replies: allReplies },
      { new: true }
    );

    if (!updatePost)
      return next(new HttpError("Can't able to post replie", 400));

    res.json({ success: true, post: updatePost });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { _id } = req.params;

    const post = await Post.findById({ _id });

    if (!post) return next(new HttpError("Post not found", 404));

    if (post.postedBy.toString() !== req.id)
      return next(new HttpError("You can't delete this post", 401));

    await Post.findByIdAndRemove({ _id });

    res.json({ success: true, post });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

export { createPost, getPost, deletePost, likeAndUnlike, replies };
