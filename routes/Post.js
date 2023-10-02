import { Router } from "express";

import {
  createPost,
  deletePost,
  getPost,
  likeAndUnlike,
} from "../controller/Post.js";
import { createPostsValiation } from "../validation/postValid.js";
import userProtect from "../middlewares/protect.js";

const router = Router();

router
  .get("/:_id", getPost)
  .post("/", userProtect, createPostsValiation, createPost)
  .patch("/toggleLike/:_id", userProtect, likeAndUnlike)
  .delete("/:_id", userProtect, deletePost);

export default router;
