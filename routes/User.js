import { Router } from "express";

import {
  followUnfollowUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../controller/User.js";
import { createUserValiation } from "../validation/userValid.js";
import userProtect from "../middlewares/protect.js";

const router = Router();

router
  .post("/", createUserValiation, signupUser)
  .post("/login", loginUser)
  .post("/logout", logoutUser)
  .patch("/followUser/:id", userProtect, followUnfollowUser);

export default router;
