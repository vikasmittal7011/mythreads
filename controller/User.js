import bcryptjs from "bcryptjs";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";

import { User } from "../modals/User.js";
import HttpError from "../modals/http-error.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookies.js";
import mongoose from "mongoose";

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
    if (user && user.name) {
      return next(new HttpError("User is already exsist", 401));
    }

    bcryptjs.hash(password, +salt).then(async (pass) => {
      const createUser = { username, email, password: pass, name };
      user = await User.create(createUser);
      const token = generateTokenAndSetCookie(user.id, res);
      return res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username },
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

    res.json({
      token,
      success: true,
      user: { id: _id, username: user.username },
    });
  } catch (err) {
    return next(new HttpError(err.message, 422));
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

const followUnfollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const modifyingUser = await User.findById({ _id: id, freeze: false });
    const modifyerUser = await User.findById({ _id: req.id });

    if (id === req.id)
      return next(new HttpError("You can't follow/unfollow your self", 401));

    if (!modifyerUser || !modifyingUser)
      return next(new HttpError("Bad request", 404));

    const isFollow = modifyerUser.following.includes(id);

    if (isFollow) {
      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { followers: req.id } }
      );
      await User.findByIdAndUpdate(
        { _id: req.id },
        { $pull: { following: id } }
      );
      res.json({ success: true, message: "Successfully unfollow the user" });
    } else {
      await User.findByIdAndUpdate(
        { _id: id },
        { $push: { followers: req.id } }
      );
      await User.findByIdAndUpdate(
        { _id: req.id },
        { $push: { following: id } }
      );

      modifyingUser.verified =
        modifyingUser.followers.length + 1 > 10 ? true : false;

      res.json({ success: true });
    }
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = req.id;

    const { username, name, bio, email } = req.body;
    let { image } = req.body;

    if (req.id !== id)
      return next(
        new HttpError("You are not right user to update profile", 401)
      );

    const users = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (users) {
      if (users?._id?.toString() !== id) {
        return next(
          new HttpError(
            "Enable to update user username or email is already exsist",
            401
          )
        );
      }
    }

    if (image) {
      if (users.image !== image) {
        if (users.image) {
          await cloudinary.uploader.destroy(
            users.image.split("/").pop().split(".")[0]
          );
        }
        const cloundinaryResponse = await cloudinary.uploader.upload(image);
        image = cloundinaryResponse.secure_url;
      }
    } else image = "";

    const user = await User.findByIdAndUpdate(
      { _id: req.id },
      { name, username, email, image, bio },
      {
        new: true,
      }
    ).select("username email name bio image");

    if (user) res.json({ success: true, user });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username, freeze: false }).select(
      "-password"
    );

    console.log(user);

    if (!user) return next(new HttpError("User not found", 404));

    res.json({ success: true, user });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const id = req.id;

    const user = await User.findOne({ _id: id }).select(
      "username name email image bio"
    );

    if (!user) return next(new HttpError("User not found", 404));

    res.json({ success: true, user });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const getSuggestedUser = async (req, res, next) => {
  try {
    const _id = req.id;

    const usersFollowedByYou = await User.findById({ _id }).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(_id) },
          freeze: { $ne: true },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );

    const suggestedUser = filteredUsers.splice(0, 4);

    suggestedUser.map((user) => (user.password = ""));

    res.json({ users: suggestedUser, success: true });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const freezeAccount = async (req, res, next) => {
  try {
    const _id = req.id;

    const user = await User.findById({ _id }).select("-password");

    if (!user) {
      new HttpError("Account not found", 404);
    }

    user.freeze = !user.freeze;

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const searchUser = async (req, res, next) => {
  try {
    const _id = req.id;
    const { name } = req.params;

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(_id) },
          freeze: { $ne: true },
          $or: [
            { name: { $in: regexForValues([name]) } },
            { username: { $in: regexForValues([name]) } },
          ],
        },
      },
    ]);

    users.map((user) => (user.password = ""));

    res.json({ users, success: true });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const regexForValues = (values) =>
  values.map((value) => new RegExp(value, "i"));

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getProfile,
  getUserProfile,
  getSuggestedUser,
  freezeAccount,
  searchUser,
};
