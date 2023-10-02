import { Router } from "express";

import { createPost, getPost } from "../controller/Post.js";
import { createPostsValiation } from "../validation/postValid.js";
import userProtect from "../middlewares/protect.js";

const router = Router();

router
  .get("/:_id", getPost)
  .post("/", userProtect, createPostsValiation, createPost);

export default router;
