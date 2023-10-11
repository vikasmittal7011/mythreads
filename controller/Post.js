import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";

import HttpError from "../modals/http-error.js";
import { Post } from "../modals/Post.js";
import { User } from "../modals/User.js";

const getPost = async (req, res, next) => {
  try {
    const { _id } = req.params;

    const post = await Post.findById({ _id })
      .populate({
        path: "postedBy",
        select: "name username image",
      })
      .populate({
        path: "replies.userId",
        select: "name image",
      });

    if (!post) return next(new HttpError("Post not found", 404));

    res.json({ success: true, post });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "postedBy",
        select: "name username image",
      })
      .populate({
        path: "replies.userId",
        select: "name image",
      })
      .sort({ createdAt: "-1" });

    const shuffledPosts = [...posts];
    for (let i = shuffledPosts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPosts[i], shuffledPosts[j]] = [
        shuffledPosts[j],
        shuffledPosts[i],
      ];
    }

    res.json({ posts: shuffledPosts, success: true });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages, 422));
  }
  try {
    const { text } = req.body;
    let { img } = req.body;
    const id = req.id;

    if (img) {
      const cloundinaryResponse = await cloudinary.uploader.upload(img);
      img = cloundinaryResponse.secure_url;
    } else img = "";

    const post = new Post({ text, postedBy: id, img });

    await post.save();

    if (!post)
      return next(new HttpError("Connot able to add post try again", 400));

    const user = await User.findOne({ _id: id });

    res.json({ success: true, post, username: user.username });
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

    let updatedPost;

    if (isLikes) {
      updatedPost = await Post.findByIdAndUpdate(
        { _id },
        { $pull: { likes: id } },
        { new: true }
      )
        .populate({
          path: "postedBy",
          select: "name username image",
        })
        .populate({
          path: "replies.userId",
          select: "name image",
        });
      res.json({
        message: "Post unlike successfully",
        success: true,
        post: updatedPost,
      });
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        { _id },
        { $push: { likes: id } },
        { new: true }
      )
        .populate({
          path: "postedBy",
          select: "name username image",
        })
        .populate({
          path: "replies.userId",
          select: "name image",
        });
      res.json({
        message: "Post like successfully",
        success: true,
        post: updatedPost,
      });
    }
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

const getFeed = async (req, res, next) => {
  try {
    const _id = req.id;

    const user = await User.findOne({ _id });

    if (!user) return next(new HttpError("User not found", 404));

    const following = await user.following;

    const posts = await Post.find({ postedBy: { $in: following } }).populate({
      path: "postedBy",
      select: "name username image",
    });

    res.json({ success: true, posts });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const getUserPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const posts = await Post.find({ postedBy: id }).populate({
      path: "postedBy",
      select: "name username image",
    });

    res.json({ success: true, posts });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

export {
  createPost,
  getPost,
  deletePost,
  likeAndUnlike,
  replies,
  getFeed,
  getUserPost,
  getPosts,
};
