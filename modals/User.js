import { Schema, model } from "mongoose";

const UserSehema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLenght: 8 },
    image: { type: String, default: "" },
    bio: { type: String, default: "" },
    freeze: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    followers: [{ type: String }],
    following: [{ type: String }],
  },
  { timestamps: true }
);

UserSehema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
UserSehema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const User = model("User", UserSehema);
