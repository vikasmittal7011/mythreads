import { Router } from "express";

import {
  followUnfollowUser,
  getProfile,
  getSuggestedUser,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
} from "../controller/User.js";
import { createUserValiation } from "../validation/userValid.js";
import userProtect from "../middlewares/protect.js";

const router = Router();

router
  .get("/profile", userProtect, getUserProfile)
  .get("/profile/:username", getProfile)
  .get("/suggested/user", userProtect, getSuggestedUser)
  .post("/", createUserValiation, signupUser)
  .post("/login", loginUser)
  .post("/logout", logoutUser)
  .patch("/followUser/:id", userProtect, followUnfollowUser)
  .patch("/update", userProtect, updateUser);

export default router;
