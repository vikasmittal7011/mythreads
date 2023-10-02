import { Router } from "express";

import { createPost } from "../controller/Post.js";
import userProtect from "../middlewares/protect.js";
import { createPostsValiation } from "../validation/postValid.js";

const router = Router();

router.post("/", userProtect, createPostsValiation, createPost);

export default router;
