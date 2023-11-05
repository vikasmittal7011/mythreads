import cors from "cors";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import express, { json } from "express";
import cookieparser from "cookie-parser";
import { v2 as cloundinary } from "cloudinary";

dotenv.config();

import { connection } from "./utils/connection.js";

import { app, server } from "./socket/socket.js";

import user from "./routes/User.js";
import post from "./routes/Post.js";
import message from "./routes/Message.js";
import HttpError from "./modals/http-error.js";

connection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.resolve(__dirname, "build")));

app.use(json({ limit: "50mb" }));
app.use(cookieparser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

cloundinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_PUBLIC,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api/user", user);
app.use("/api/post", post);
app.use("/api/message", message);

app.get("*", (req, res) => {
  res.sendFile(path.resolve("build", "index.html"));
});

app.use((req, res, next) => {
  next(new HttpError("Not route found", 404));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.errorCode || 500)
    .json({ message: error.message || "Unknow error accour" });
});

server.listen(5000);
