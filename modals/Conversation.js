import { Schema, model } from "mongoose";
const { ObjectId } = Schema;

const ConversationSehema = Schema(
  {
    participants: [
      {
        type: ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      text: { type: String, required: true, maxLength: 500 },
      sender: {
        type: ObjectId,
        ref: "User",
        required: true,
      },
    },
  },
  { timestamps: true }
);

ConversationSehema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
ConversationSehema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const Post = model("Conversation", ConversationSehema);
