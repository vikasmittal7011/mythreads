import express, { json } from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connection } from "./utils/connection.js";

const app = express();

import user from "./routes/User.js";
import post from "./routes/Post.js";
import HttpError from "./modals/http-error.js";

connection();

app.use(json());
app.use(cors());
app.use(cookieparser());

app.use("/api/user", user);
app.use("/api/post", post);

app.use((req, res, next) => {
  next(new HttpError("Not route found", 404));
});

app.use((error, req, res, next) => {
  //   if (req.files) {
  //     fs.unlink(req.files.thumbnail[0].path, (err) => {});
  //     if (req.files.image1) {
  //       fs.unlink(req.files.image1[0].path, (err) => {});
  //     }
  //     if (req.files.image2) {
  //       fs.unlink(req.files.image2[0].path, (err) => {});
  //     }
  //     if (req.files.image3) {
  //       fs.unlink(req.files.image3[0].path, (err) => {});
  //     }
  //     if (req.files.image4) {
  //       fs.unlink(req.files.image4[0].path, (err) => {});
  //     }
  //   }
  if (res.heardersSent) {
    return next(error);
  }
  res
    .status(error.errorCode || 500)
    .json({ message: error.message || "Unknow error accour" || error.message });
});

app.listen(5000);
