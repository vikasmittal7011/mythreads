import express, { json } from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloundinary } from "cloudinary";

dotenv.config();

import { connection } from "./utils/connection.js";

const app = express();

import user from "./routes/User.js";
import post from "./routes/Post.js";
import HttpError from "./modals/http-error.js";

connection();

app.use(json({ limit: "10mb" }));
app.use(cookieparser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

cloundinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_PUBLIC,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api/user", user);
app.use("/api/post", post);

app.use((req, res, next) => {
  next(new HttpError("Not route found", 404));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.errorCode || 500)
    .json({ message: error.message || "Unknow error accour" || error.message });
});

app.listen(5000);
