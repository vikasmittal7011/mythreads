import { Router } from "express";

import {
  createPost,
  deletePost,
  getFeed,
  getPost,
  getPosts,
  getUserPost,
  likeAndUnlike,
  replies,
} from "../controller/Post.js";
import { createPostsValiation } from "../validation/postValid.js";
import userProtect from "../middlewares/protect.js";

const router = Router();

router
  .get("/posts", getPosts)
  .get("/feed", userProtect, getFeed)
  .get("/user-post/:id", getUserPost)
  .get("/:_id", getPost)
  .post("/", userProtect, createPostsValiation, createPost)
  .patch("/toggleLike/:_id", userProtect, likeAndUnlike)
  .patch("/replie/:_id", userProtect, replies)
  .delete("/:_id", userProtect, deletePost);

export default router;
