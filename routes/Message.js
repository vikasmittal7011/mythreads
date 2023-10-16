import { Router } from "express";

import userProtect from "../middlewares/protect.js";
import {
  getConversations,
  getMessage,
  sendMessage,
} from "../controller/Message.js";

const router = Router();

router
  .get("/conversation", userProtect, getConversations)
  .get("/:reciptantId", userProtect, getMessage)
  .post("/", userProtect, sendMessage);

export default router;
