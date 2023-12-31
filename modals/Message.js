import { Schema, model } from "mongoose";
const { ObjectId } = Schema;

const MessageSehema = Schema(
  {
    sender: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, maxLength: 500 },
    conversationId: { type: ObjectId, ref: "Conversation", required: true },
    seen: { type: Boolean, default: false },
    img: { type: String, default: "" },
  },
  { timestamps: true }
);

MessageSehema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting to JSON
MessageSehema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const Message = model("Message", MessageSehema);
