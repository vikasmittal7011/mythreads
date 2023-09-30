import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../modals/User.js";
import { validationResult } from "express-validator";
import HttpError from "../modals/http-error.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookies.js";

const salt = process.env.SALT;

const signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages, 422));
  }
  let user;
  try {
    const { username, email, password, name } = req.body;
    user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return next(new HttpError("User is already exsist", 401));
    }

    bcryptjs.hash(password, +salt).then(async (pass) => {
      const createUser = { username, email, password: pass, name };
      user = await User.create(createUser);
      const token = generateTokenAndSetCookie(user.id, res);
      return res.json({
        success: true,
        token,
      });
    });
  } catch (error) {
    return next(new HttpError(error.message, 422));
  }
};

const loginUser = async (req, res, next) => {
  let { password } = req.body;
  let user, comparePassword;
  try {
    user = await User.findOne({ username: req.body.username });

    if (!user) {
      res.json({ message: "Enter valid credential" });
      return;
    }

    comparePassword = await bcryptjs.compare(password, user.password);

    if (!comparePassword) {
      res.json({ message: "Enter valid credential" });
      return;
    }

    const { _id } = user;

    const token = generateTokenAndSetCookie(_id, res);

    res.json({ token, success: true });
  } catch (err) {
    return next(new HttpError(error.message, 422));
  }
};

const logoutUser = (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.json({ message: "Logout successfully", success: true });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

export { signupUser, loginUser, logoutUser };
