import HttpError from "../modals/http-error.js";
import { Message } from "../modals/Message.js";
import { Conversation } from "../modals/Conversation.js";
import { getRecipientUserId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, message, imgUrl } = req.body;
    const senderId = req.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    let imageUrl;

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: { text: message, sender: senderId },
      });

      await conversation.save();
    }

    if (imgUrl) {
      const cloundinaryResponse = await cloudinary.uploader.upload(imgUrl);
      imageUrl = cloundinaryResponse.secure_url;
    }

    const newMessage = new Message({
      sender: senderId,
      text: message || "",
      img: imageUrl || "",
      conversationId: conversation.id,
    });

    await newMessage.save();

    await conversation.updateOne({
      lastMessage: { text: message || "Image", sender: senderId },
    });

    const recipientSocketId = getRecipientUserId(recipientId);

    if (recipientId) io.to(recipientSocketId).emit("newMessage", newMessage);

    res.json({ message: newMessage, success: true });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const getMessage = async (req, res, next) => {
  try {
    const { reciptantId } = req.params;
    const sender = req.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [reciptantId, sender] },
    });

    if (!conversation)
      return next(new HttpError("Conversation Not Found", 404));

    const messages = await Message.find({
      conversationId: conversation.id,
    }).sort({ createdAt: 1 });

    res.json({ messages, success: true });
  } catch (error) {
    error;
    next(new HttpError(error.message, 500));
  }
};

const getConversations = async (req, res, next) => {
  try {
    const sender = req.id;

    const conversations = await Conversation.find({
      participants: sender,
    }).populate({
      path: "participants",
      select: "username image name verified",
    });

    if (!conversations)
      return next(new HttpError("Conversation Not Found", 404));

    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== sender.toString()
      );
    });

    res.json({ conversations, success: true });
  } catch (error) {
    error;
    next(new HttpError(error.message, 500));
  }
};

export { sendMessage, getMessage, getConversations };
