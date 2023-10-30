import { Server } from "socket.io";
import http from "http";
import express from "express";
const app = express();

import { Message } from "../modals/Message.js";
import { Conversation } from "../modals/Conversation.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userid;

  if (userId !== "undefined") userSocketMap[userId] = socket.id;

  io.emit("getOnlineUser", Object.keys(userSocketMap));

  socket.on("markMessageAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId, seen: false },
        { $set: { seen: true } },
        { new: true }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );
      io.to(userSocketMap[userId]).emit("messageSeen", { conversationId });
    } catch (err) {}
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });
});

const getRecipientUserId = (recipient) => userSocketMap[recipient];

export { io, server, app, getRecipientUserId };
