import express, { json } from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connection } from "./utils/connection.js";

const app = express();

import user from "./routes/User.js";
import post from "./routes/Post.js";

connection();

app.use(json());
app.use(cors());
app.use(cookieparser());

app.use("/api/user", user);
app.use("/api/post", post);

app.listen(5000);
