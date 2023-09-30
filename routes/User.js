import { Router } from "express";

import { loginUser, logoutUser, signupUser } from "../controller/User.js";
import { createUserValiation } from "../validation/userValid.js";

const router = Router();

router
  .post("/", createUserValiation, signupUser)
  .post("/login", loginUser)
  .post("/logout", logoutUser);

export default router;
