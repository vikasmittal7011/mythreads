import { Schema, model } from "mongoose";
const { ObjectId } = Schema;

const PostSehema = Schema(
  {
    postedBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, maxLength: 500 },
    img: { type: String, default: "" },
    likes: [{ type: ObjectId, ref: "User" }],
    replies: [
      {
        userId: { type: ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

PostSehema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
PostSehema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const Post = model("Post", PostSehema);
